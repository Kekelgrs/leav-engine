import * as hapi from '@hapi/hapi';
import {ApolloServer} from 'apollo-server-hapi';
import {IAuthApp} from 'app/auth/authApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {execute, GraphQLFormattedError} from 'graphql';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import {i18n} from 'i18next';
import {IUtils} from 'utils/utils';
import * as uuid from 'uuid';
import * as winston from 'winston';
import {ErrorTypes, IExtendedErrorMsg} from '../_types/errors';

export interface IServer {
    init(): Promise<void>;
}

interface IDeps {
    config?: any;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.auth'?: IAuthApp;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export default function({
    config: config = null,
    'core.app.graphql': graphqlApp = null,
    'core.app.auth': authApp = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null,
    translator = null
}: IDeps = {}): IServer {
    const _handleError = (err: GraphQLFormattedError, {context}: any) => {
        const newError = {...err};

        const isGraphlValidationError = err.extensions && err.extensions.code === 'GRAPHQL_VALIDATION_FAILED';
        const errorType = err?.extensions.exception.type ?? ErrorTypes.INTERNAL_ERROR;
        const errorFields = err?.extensions.exception.fields ?? {};
        const errorAction = err?.extensions.exception.action ?? null;

        // Translate errors details
        for (const [field, errorDetails] of Object.entries(errorFields)) {
            const toTranslate =
                typeof errorDetails === 'string' ? {msg: errorDetails, vars: {}} : (errorDetails as IExtendedErrorMsg);

            const lang = context.lang ?? config.lang.default;
            errorFields[field] = translator.t(('errors.' + toTranslate.msg) as string, {
                ...toTranslate.vars,
                lng: lang,
                interpolation: {escapeValue: false}
            });
        }

        newError.extensions.code = errorType;
        newError.extensions.fields = errorFields;
        newError.extensions.action = errorAction;

        if (
            errorType === ErrorTypes.VALIDATION_ERROR ||
            errorType === ErrorTypes.PERMISSION_ERROR ||
            isGraphlValidationError
        ) {
            return newError;
        }

        const errId = uuid.v4();

        // Error is logged with original message
        newError.message = `[${errId}] ${err.message}`;
        logger.error(`${newError.message}\n${err.extensions.exception.stacktrace.join('\n')}`);

        if (!config.debug) {
            newError.message = `[${errId}] Internal Error`;
        }

        return newError;
    };

    return {
        async init(): Promise<void> {
            const server: hapi.Server = new hapi.Server({
                host: config.server.host,
                port: config.server.port
            });

            try {
                // Auth Check
                await server.register(hapiAuthJwt2);
                server.auth.strategy('core', config.auth.scheme, {
                    key: config.auth.key,
                    validate: async (decode, request) => {
                        try {
                            const isValid = await authApp.validateToken(decode);
                            return {isValid};
                        } catch (e) {
                            logger.error(e);
                            throw e;
                        }
                    },
                    verifyOptions: {algorithms: ['HS256']}
                });

                // Auth App to login
                authApp.registerRoute(server);
                server.auth.default('core');

                await graphqlApp.generateSchema();

                const _executor = args => {
                    return execute({
                        ...args,
                        schema: graphqlApp.schema,
                        contextValue: args.context,
                        variableValues: args.request.variables
                    });
                };

                const apolloServ = new ApolloServer({
                    debug: config.debug,
                    formatResponse: (resp, ctx) => {
                        // const formattedErrors = resp.errors ? resp.errors.map(e => _handleError(e, ctx)) : null;

                        const formattedResp = {...resp};

                        if (resp.errors) {
                            formattedResp.errors = resp.errors.map(e => _handleError(e, ctx));
                        }

                        return formattedResp;
                    },
                    tracing: true,
                    cacheControl: false,
                    context: ({request}) => {
                        return {
                            auth: request.auth.isAuthenticated ? request.auth.credentials : false,
                            lang: request.query.lang ?? config.lang.default
                        };
                    },
                    // We're using a gateway here instead of a simple schema definition because we need to be able
                    // to reload schema when a change occurs (new library, new attribute...)
                    gateway: {
                        load: () => {
                            return Promise.resolve({
                                schema: graphqlApp.schema,
                                executor: _executor
                            });
                        },
                        executor: _executor,
                        /**
                         * Init the function we want to call on schema change.
                         * The callback received here is an Apollo internal function which actually update
                         * the schema stored by Apollo Server. We init an event listener to execute this function
                         * when a change occurs (new library, new attribute...)
                         */
                        onSchemaChange: callback => {
                            graphqlApp.schemaUpdateEmitter.on(graphqlApp.SCHEMA_UPDATE_EVENT, callback);

                            return () => graphqlApp.schemaUpdateEmitter.off(graphqlApp.SCHEMA_UPDATE_EVENT, callback);
                        }
                    },
                    subscriptions: false
                });
                await apolloServ.applyMiddleware({app: server, cors: true, path: '/graphql'});

                await server.start();
                logger.info(`Server running at: ${server.info.uri}`);
            } catch (e) {
                utils.rethrow(e, 'Server init error:');
            }
        }
    };
}
