// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloServerPluginCacheControlDisabled} from 'apollo-server-core';
import {ApolloServer, AuthenticationError as ApolloAuthenticationError} from 'apollo-server-express';
import {IApplicationApp} from 'app/application/applicationApp';
import {IAuthApp} from 'app/auth/authApp';
import {IFilesManagerApp} from 'app/core/filesManagerApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import cookieParser from 'cookie-parser';
import express, {NextFunction, Request, Response} from 'express';
import {execute, GraphQLFormattedError} from 'graphql';
import {graphqlUploadExpress} from 'graphql-upload';
import * as graphqlWS from 'graphql-ws/lib/use/ws';
import {createServer} from 'http';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as winston from 'winston';
import {WebSocketServer} from 'ws';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import AuthenticationError from '../errors/AuthenticationError';
import {ACCESS_TOKEN_COOKIE_NAME, API_KEY_PARAM_NAME} from '../_types/auth';
import {ErrorTypes, IExtendedErrorMsg} from '../_types/errors';

export interface IServer {
    init(): Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.auth'?: IAuthApp;
    'core.app.core.filesManager'?: IFilesManagerApp;
    'core.app.application'?: IApplicationApp;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
}

export default function ({
    config: config = null,
    'core.app.graphql': graphqlApp = null,
    'core.app.auth': authApp = null,
    'core.app.core.filesManager': filesManagerApp = null,
    'core.app.application': applicationApp = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null
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

            errorFields[field] = utils.translateError(toTranslate, lang);
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

        const errId = uuidv4();

        // Error is logged with original message
        newError.message = `[${errId}] ${err.message}`;
        logger.error(`${newError.message}\n${err.extensions.exception.stacktrace.join('\n')}`);

        if (!config.debug) {
            newError.message = `[${errId}] Internal Error`;
        }

        return newError;
    };

    const _checkAuth = async (req, res, next) => {
        try {
            await authApp.validateRequestToken({apiKey: String(req.query[API_KEY_PARAM_NAME]), cookies: req.cookies});

            next();
        } catch (err) {
            next(err);
        }
    };

    return {
        async init(): Promise<void> {
            const app = express();
            const httpServer = createServer(app);

            try {
                // Express settings
                app.set('port', config.server.port);
                app.set('host', config.server.host);
                app.use(express.json({limit: config.server.uploadLimit}));
                app.use(express.urlencoded({extended: true, limit: config.server.uploadLimit}));
                app.use(graphqlUploadExpress());
                app.use(cookieParser());

                // CORS
                app.use((req, res, next) => {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
                    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');

                    return req.method === 'OPTIONS' ? res.sendStatus(204) : next();
                });

                // Initialize routes
                authApp.registerRoute(app);
                filesManagerApp.registerRoute(app);

                app.use('/previews', [_checkAuth, express.static(config.preview.directory)]);
                app.use('/exports', [_checkAuth, express.static(config.export.directory)]);

                // Handling errors
                app.use((err: any, req: Request, res: Response, next: NextFunction) => {
                    if (!err) {
                        return next ? next() : res.end();
                    }

                    if (err instanceof SyntaxError) {
                        return res.status(400).json({message: err.name});
                    }

                    if (err instanceof AuthenticationError) {
                        return res.status(401).send('Unauthorized');
                    }

                    res.status(500).json({error: 'INTERNAL_SERVER_ERROR'}); // FIXME: format error msg?
                });

                await graphqlApp.generateSchema();

                const _executor = args =>
                    execute({
                        ...args,
                        schema: graphqlApp.schema,
                        contextValue: args.context,
                        variableValues: args.request.variables
                    }) as Promise<any>;

                // Create Web Socket Server
                const wsServer = new WebSocketServer({
                    server: httpServer,
                    path: '/graphql'
                });

                // Hand in the schema we just created and have the
                // WebSocketServer start listening.
                const serverCleanup = graphqlWS.useServer(
                    {
                        schema: graphqlApp.schema,
                        context: async (ctx: any) => {
                            try {
                                // recreate headers object from rawHeaders array
                                const headers = ctx.extra.request.rawHeaders.reduce((prev, curr, i, arr) => {
                                    return !(i % 2) ? {...prev, [curr]: arr[i + 1]} : prev;
                                }, {});

                                if (headers.Cookie?.includes(ACCESS_TOKEN_COOKIE_NAME)) {
                                    const arrCookie = headers.Cookie.split('=');
                                    const tokenIdx = headers.Cookie.split('=').indexOf(ACCESS_TOKEN_COOKIE_NAME) + 1;

                                    const payload = await authApp.validateRequestToken({
                                        apiKey: null,
                                        cookies: {[ACCESS_TOKEN_COOKIE_NAME]: arrCookie[tokenIdx]}
                                    });

                                    const context: IQueryInfos = {
                                        userId: payload.userId,
                                        groupsId: payload.groupsId
                                    };

                                    return context;
                                } else {
                                    throw new ApolloAuthenticationError('you must be logged in');
                                }
                            } catch (e) {
                                throw new ApolloAuthenticationError('you must be logged in');
                            }
                        }
                    },
                    wsServer
                );

                const server = new ApolloServer({
                    debug: config.debug,
                    introspection: true,
                    plugins: [
                        require('apollo-tracing').plugin(),
                        ApolloServerPluginCacheControlDisabled(),
                        {
                            async serverWillStart() {
                                return {
                                    async drainServer() {
                                        await serverCleanup.dispose();
                                    }
                                };
                            }
                        }
                    ],
                    formatResponse: (resp, ctx) => {
                        const formattedResp = {...resp};

                        if (resp.errors) {
                            formattedResp.errors = resp.errors.map(e => _handleError(e, ctx));
                        }

                        const context: IQueryInfos = ctx.context;

                        if (context.dbProfiler) {
                            formattedResp.extensions = {
                                dbProfiler: {
                                    ...context.dbProfiler,
                                    // Transform queries hash map into an array, sort queries by count
                                    queries: Object.values(context.dbProfiler.queries)
                                        .map(q => ({...q, callers: [...q.callers]})) // Transform callers Set into Array
                                        .sort((a: any, b: any) => b.count - a.count)
                                }
                            };
                        }

                        return formattedResp;
                    },
                    context: async ({req, res}): Promise<IQueryInfos> => {
                        try {
                            const payload = await authApp.validateRequestToken({
                                apiKey: String(req.query[API_KEY_PARAM_NAME]),
                                cookies: req.cookies
                            });

                            const ctx: IQueryInfos = {
                                userId: payload.userId,
                                lang: (req.query.lang as string) ?? config.lang.default,
                                queryId: req.body.requestId || uuidv4(),
                                groupsId: payload.groupsId
                            };

                            return ctx;
                        } catch (e) {
                            throw new ApolloAuthenticationError(e.message ?? 'You must be logged in');
                        }
                    },
                    // We're using a gateway here instead of a simple schema definition because we need to be able
                    // to reload schema when a change occurs (new library, new attribute...)
                    gateway: {
                        load: () =>
                            Promise.resolve({
                                schema: graphqlApp.schema,
                                executor: _executor
                            }),
                        /**
                         * Init the function we want to call on schema change.
                         * The callback received here is an Apollo internal function which actually update
                         * the schema stored by Apollo Server. We init an event listener to execute this function
                         * when a change occurs (new library, new attribute...)
                         */
                        onSchemaChange: callback => {
                            graphqlApp.schemaUpdateEmitter.on(graphqlApp.SCHEMA_UPDATE_EVENT, callback);
                            return () => graphqlApp.schemaUpdateEmitter.off(graphqlApp.SCHEMA_UPDATE_EVENT, callback);
                        },
                        stop: Promise.resolve
                    }
                });

                await server.start();
                server.applyMiddleware({app, path: '/graphql', cors: true});

                applicationApp.registerRoute(app);

                await new Promise<void>(resolve => httpServer.listen(config.server.port, resolve));
                logger.info(`🚀 Server ready at http://localhost:${config.server.port}${server.graphqlPath}`);
            } catch (e) {
                utils.rethrow(e, 'Server init error:');
            }
        }
    };
}
