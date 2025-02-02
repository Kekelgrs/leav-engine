// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {IApiKeyDomain} from 'domain/apiKey/apiKeyDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {Express, NextFunction, Request, Response} from 'express';
import useragent from 'express-useragent';
import jwt, {Algorithm} from 'jsonwebtoken';
import ms from 'ms';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IStandardValue, ITreeValue} from '_types/value';
import AuthenticationError from '../../errors/AuthenticationError';
import {USERS_GROUP_ATTRIBUTE_NAME} from '../../infra/permission/permissionRepo';
import {ACCESS_TOKEN_COOKIE_NAME, ITokenUserData} from '../../_types/auth';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition, IRecord} from '../../_types/record';

export interface IAuthApp {
    getGraphQLSchema(): IAppGraphQLSchema;
    validateRequestToken(params: {apiKey?: string; cookies?: {}}): Promise<ITokenUserData>;
    registerRoute(app: Express): void;
}

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.apiKey'?: IApiKeyDomain;
    'core.domain.user'?: IUserDomain;
    config?: IConfig;
}

export default function ({
    'core.domain.value': valueDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.apiKey': apiKeyDomain = null,
    'core.domain.user': userDomain = null,
    config = null
}: IDeps = {}): IAuthApp {
    return {
        getGraphQLSchema(): IAppGraphQLSchema {
            return {
                typeDefs: `
                    extend type Query {
                        me: User
                    }
                `,
                resolvers: {
                    Query: {
                        async me(parent, args, ctx, info): Promise<IRecord> {
                            const users = await recordDomain.find({
                                params: {
                                    library: 'users',
                                    filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: ctx.userId}],
                                    withCount: false,
                                    retrieveInactive: true
                                },
                                ctx
                            });

                            return users.list[0];
                        }
                    }
                }
            };
        },
        registerRoute(app): void {
            app.post(
                '/auth/authenticate',
                async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        const {login, password} = req.body as any;

                        if (typeof login === 'undefined' || typeof password === 'undefined') {
                            return res.status(401).send('Missing credentials');
                        }

                        // Get user id
                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'authenticate'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'login', condition: AttributeCondition.EQUAL, value: login}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            return res.status(401).send('Invalid credentials');
                        }

                        // Check password
                        const user = users.list[0];
                        const userPwd: IStandardValue[] = await valueDomain.getValues({
                            library: 'users',
                            recordId: user.id,
                            attribute: 'password',
                            ctx
                        });

                        const isValidPwd =
                            !!userPwd[0].raw_value && (await bcrypt.compare(password, userPwd[0].raw_value));

                        if (!isValidPwd) {
                            return res.status(401).send('Invalid credentials');
                        }

                        // get groups node id
                        const groupsId = (
                            await valueDomain.getValues({
                                library: 'users',
                                recordId: user.id,
                                attribute: 'user_groups',
                                ctx
                            })
                        ).map(g => g.value.id);

                        const tokenExpiration = String(config.auth.tokenExpiration);

                        // Generate token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                login: user.login,
                                role: 'admin',
                                groupsId
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm as Algorithm,
                                expiresIn: tokenExpiration
                            }
                        );

                        // We need the milliseconds value to set cookie expiration
                        // ms is the package used by jsonwebtoken under the hood, hence we're sure the value is same
                        const cookieExpires = ms(tokenExpiration);
                        res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
                            httpOnly: true,
                            sameSite: config.auth.cookie.sameSite,
                            secure: config.auth.cookie.secure,
                            domain: req.headers.host,
                            expires: new Date(Date.now() + cookieExpires)
                        });

                        return res.status(200).json({
                            token
                        });
                    } catch (err) {
                        next(err);
                    }
                }
            );

            app.post(
                '/auth/logout',
                (req: Request, res: Response): Response => {
                    res.cookie(ACCESS_TOKEN_COOKIE_NAME, '', {
                        expires: new Date(0),
                        httpOnly: true,
                        sameSite: config.auth.cookie.sameSite,
                        secure: config.auth.cookie.secure,
                        domain: req.headers.host
                    });

                    return res.status(200).end();
                }
            );

            app.post(
                '/auth/forgot-password',
                async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        const {email, lang} = req.body as any;
                        const ua = useragent.parse(req.headers['user-agent']);

                        if (typeof email === 'undefined' || typeof lang === 'undefined') {
                            return res.status(400).send('Missing parameters');
                        }

                        // Get user id
                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'forgot-password'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'email', condition: AttributeCondition.EQUAL, value: email}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            return res.status(401).send('Email not found');
                        }

                        const user = users.list[0];

                        // Generate token
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                email: user.email
                            },
                            config.auth.key,
                            {
                                algorithm: config.auth.algorithm as Algorithm,
                                expiresIn: String(config.auth.resetPasswordExpiration)
                            }
                        );

                        await userDomain.sendResetPasswordEmail(
                            user.email,
                            token,
                            user.login,
                            ua.browser,
                            ua.os,
                            lang,
                            ctx
                        );

                        return res.sendStatus(200);
                    } catch (err) {
                        next(err);
                    }
                }
            );

            app.post(
                '/auth/reset-password',
                async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        const {token, newPassword} = req.body as any;

                        if (typeof token === 'undefined' || typeof newPassword === 'undefined') {
                            return res.status(400).send('Missing required parameters');
                        }

                        let payload: jwt.JwtPayload;

                        // to catch expired token error properly
                        try {
                            payload = jwt.verify(token, config.auth.key) as jwt.JwtPayload;
                        } catch (e) {
                            throw new AuthenticationError('Invalid token');
                        }

                        if (typeof payload.userId === 'undefined' || typeof payload.email === 'undefined') {
                            throw new AuthenticationError('Invalid token');
                        }

                        const ctx: IQueryInfos = {
                            userId: config.defaultUserId,
                            queryId: 'resetPassword'
                        };

                        const users = await recordDomain.find({
                            params: {
                                library: 'users',
                                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: payload.userId}]
                            },
                            ctx
                        });

                        if (!users.list.length) {
                            throw new AuthenticationError('User not found');
                        }

                        try {
                            // save new password
                            await valueDomain.saveValue({
                                library: 'users',
                                recordId: payload.userId,
                                attribute: 'password',
                                value: {value: newPassword},
                                ctx
                            });
                        } catch (e) {
                            return res.status(422).send('Invalid password');
                        }

                        return res.sendStatus(200);
                    } catch (err) {
                        next(err);
                    }
                }
            );
        },
        async validateRequestToken({apiKey, cookies}) {
            const ctx: IQueryInfos = {
                userId: config.defaultUserId,
                queryId: 'validateToken'
            };

            const token = cookies?.[ACCESS_TOKEN_COOKIE_NAME];
            let userId: string;
            let groupsId: string[];
            if (!token && !apiKey) {
                throw new AuthenticationError('No token or api key provided');
            }

            if (token) {
                // Token validation checking
                const payload = jwt.verify(token, config.auth.key) as jwt.JwtPayload;

                if (typeof payload.userId === 'undefined') {
                    throw new AuthenticationError('Invalid token');
                }

                userId = payload.userId;
                groupsId = payload.groupsId;
            }

            if (!userId && apiKey) {
                // If no valid token in cookies, check api key
                const apiKeyData = await apiKeyDomain.validateApiKey({apiKey, ctx});

                // Check API key has not expired
                const hasExpired = apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date();
                if (hasExpired) {
                    throw new AuthenticationError('API key expired');
                }

                userId = apiKeyData.userId;

                // Fetch user groups
                const userGroups = (await valueDomain.getValues({
                    library: USERS_LIBRARY,
                    recordId: userId,
                    attribute: USERS_GROUP_ATTRIBUTE_NAME,
                    ctx
                })) as ITreeValue[];
                groupsId = userGroups.map(g => g.value.id);
            }

            // Validate user
            const users = await recordDomain.find({
                params: {
                    library: 'users',
                    filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: userId}]
                },
                ctx
            });

            if (!users.list.length) {
                throw new AuthenticationError('User not found');
            }

            return {
                userId,
                groupsId
            };
        }
    };
}
