import ApolloClient, {InMemoryCache, IntrospectionFragmentMatcher, IntrospectionResultData} from 'apollo-boost';
import React from 'react';
import {ApolloProvider} from 'react-apollo';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {IsAllowedQuery, isAllowedQuery} from '../../../queries/permissions/isAllowedQuery';
import {getSysTranslationQueryLanguage, permsArrayToObject} from '../../../utils/utils';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import LangContext from '../../shared/LangContext';
import Loading from '../../shared/Loading';
import UserContext from '../../shared/UserContext';
import {IUserContext} from '../../shared/UserContext/UserContext';
import Home from '../Home';

interface IAppState {
    fragmentMatcher: IntrospectionFragmentMatcher | null;
    token: string;
}

interface IAppProps extends WithNamespaces {
    token: string;
}

class App extends React.Component<IAppProps, IAppState> {
    // TODO: handle auth token properly
    constructor(props) {
        super(props);

        this.state = {
            fragmentMatcher: null,
            token: props.token
        };

        this._getFragmentMatcher();
    }

    public render() {
        const {i18n} = this.props;
        const {fragmentMatcher, token} = this.state;

        if (!fragmentMatcher) {
            return <Loading />;
        }

        const gqlClient = new ApolloClient({
            uri: process.env.REACT_APP_API_URL,
            headers: {
                Authorization: token
            },
            cache: new InMemoryCache({fragmentMatcher})
        });

        return (
            <ApolloProvider client={gqlClient}>
                <IsAllowedQuery
                    query={isAllowedQuery}
                    variables={{
                        type: PermissionTypes.admin,
                        actions: [
                            PermissionsActions.admin_access_attributes,
                            PermissionsActions.admin_access_libraries,
                            PermissionsActions.admin_access_permissions,
                            PermissionsActions.admin_access_trees,
                            PermissionsActions.admin_create_attribute,
                            PermissionsActions.admin_create_library,
                            PermissionsActions.admin_create_tree,
                            PermissionsActions.admin_delete_attribute,
                            PermissionsActions.admin_delete_library,
                            PermissionsActions.admin_delete_tree,
                            PermissionsActions.admin_edit_attribute,
                            PermissionsActions.admin_edit_library,
                            PermissionsActions.admin_edit_permission,
                            PermissionsActions.admin_edit_tree
                        ]
                    }}
                >
                    {({loading, data, error}) => {
                        if (loading) {
                            return <Loading />;
                        }

                        // Cache admin permissions
                        if (!data || !data.isAllowed || error) {
                            return <p>Could not retrieve permissions!</p>;
                        }

                        // TODO: get real user ID and name
                        const userData: IUserContext = {
                            id: 1,
                            name: '',
                            permissions: permsArrayToObject(data.isAllowed)
                        };
                        const lang = getSysTranslationQueryLanguage(i18n);

                        return (
                            <LangContext.Provider value={{lang}}>
                                <UserContext.Provider value={userData}>
                                    <div className="App height100">
                                        <Home />
                                    </div>
                                </UserContext.Provider>
                            </LangContext.Provider>
                        );
                    }}
                </IsAllowedQuery>
            </ApolloProvider>
        );
    }

    /**
     * Retrieve information about types from server to give Apollo client some information about our schema and be able
     * to do fragments on interface or union
     * More info: https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
     */
    private _getFragmentMatcher = async () => {
        const {token} = this.state;
        const res = await fetch(process.env.REACT_APP_API_URL || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            body: JSON.stringify({
                variables: {},
                query: `{
                    __schema {
                      types {
                        kind
                        name
                        possibleTypes {
                          name
                        }
                      }
                    }
                  }
                `
            })
        });

        const resData: IntrospectionResultData = (await res.json()).data;
        resData.__schema.types = resData.__schema.types.filter(t => t.possibleTypes !== null);

        this.setState({
            fragmentMatcher: new IntrospectionFragmentMatcher({
                introspectionQueryResultData: resData
            })
        });
    }
}

export default withNamespaces()(App);
