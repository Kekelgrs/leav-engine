// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {ApolloProvider} from '@apollo/react-common';
// import {
//     defaultDataIdFromObject,
//     InMemoryCache,
//     IntrospectionFragmentMatcher,
//     IntrospectionResultData
// } from 'apollo-cache-inmemory';
// import {ApolloClient} from 'apollo-client';
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    defaultDataIdFromObject,
    HttpLink,
    InMemoryCache,
    ServerError
} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import useGraphqlPossibleTypes from 'hooks/useGraphqlPossibleTypes';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {addMessage, MessagesTypes} from 'redux/messages/messages';
import {Message, SemanticICONS} from 'semantic-ui-react';
import * as yup from 'yup';
import {ErrorTypes} from '_types/errors';
import Loading from '../../shared/Loading';

interface IApolloHandlerProps {
    token: string;
    onTokenInvalid: (message?: string) => void;
    children: ReactNode;
}

export const UNAUTHORIZED = 'Unauthorized';

const ApolloHandler = ({token, children, onTokenInvalid}: IApolloHandlerProps): JSX.Element => {
    const dispatch = useDispatch();
    const {t} = useTranslation();

    const {loading: possibleTypesLoading, error: possibleTypesError, possibleTypes} = useGraphqlPossibleTypes(
        process.env.REACT_APP_API_URL,
        token
    );

    if (possibleTypesLoading) {
        return <Loading />;
    }

    if (possibleTypesError) {
        if (possibleTypesError.includes(UNAUTHORIZED)) {
            onTokenInvalid();
            return <></>;
        }

        return (
            <Message negative style={{margin: '2em'}}>
                {possibleTypesError}
            </Message>
        );
    }

    const _handleApolloError = onError(({graphQLErrors, networkError}) => {
        let title: string;
        let content: string;
        let icon: SemanticICONS;
        if (graphQLErrors) {
            graphQLErrors.map(graphqlError => {
                const {message, extensions} = graphqlError;

                title = t(`errors.${extensions?.code ?? ErrorTypes.PERMISSION_ERROR}`);
                switch (extensions?.code) {
                    case ErrorTypes.VALIDATION_ERROR:
                        content = '';
                        break;
                    case ErrorTypes.PERMISSION_ERROR:
                        content = '';
                        icon = 'frown outline';
                        break;
                    case ErrorTypes.INTERNAL_ERROR:
                    default:
                        content = message;
                        break;
                }
            });
        } else if (networkError) {
            if ((networkError as ServerError).statusCode === 401) {
                return onTokenInvalid('login.error.session_expired');
            }

            title = t('errors.network_error');
            icon = 'plug';
        }

        dispatch(
            addMessage({
                type: MessagesTypes.ERROR,
                title,
                content,
                icon
            })
        );
    });

    const gqlClient = new ApolloClient({
        link: ApolloLink.from([
            _handleApolloError,
            new HttpLink({
                uri: process.env.REACT_APP_API_URL,
                headers: {
                    Authorization: token
                }
            })
        ]),
        cache: new InMemoryCache({
            // For records, ID might sometimes be in the _id property to avoid messing up
            // with the ID attribute (eg. in the getRecordPropertiesQuery).
            // Thus, we have to force Apollo to use the _id field for cache key.
            dataIdFromObject(responseObject) {
                // If it's not a record, just use regular caching
                if (
                    !possibleTypes ||
                    !possibleTypes.Record.includes(responseObject.__typename) ||
                    (!responseObject._id && !responseObject.id)
                ) {
                    return defaultDataIdFromObject(responseObject);
                }

                const idValue = responseObject._id || responseObject.id;
                return `${responseObject.__typename}:${String(idValue)}`;
            },
            typePolicies: {
                Query: {
                    fields: {
                        attributes: {
                            merge: true
                        }
                    }
                },
                RecordIdentity: {
                    keyFields: ['id', 'library', ['id']]
                },
                Library: {
                    fields: {
                        gqlNames: {
                            merge: true
                        }
                    }
                }
            },
            possibleTypes
        })
    });

    // Load yup messages translations
    yup.setLocale({
        string: {matches: t('admin.validation_errors.matches')},
        array: {
            min: t('admin.validation_errors.min')
        },
        mixed: {
            required: t('admin.validation_errors.required')
        }
    });

    return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
};

export default ApolloHandler;
