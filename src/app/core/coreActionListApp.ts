import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {ActionsListEvents, ActionsListIOTypes} from '../../_types/actionsList';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(actionsListDomain: IActionsListDomain): ICoreAttributeApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum ActionIOTypes {
                        ${ActionsListIOTypes.STRING}
                        ${ActionsListIOTypes.NUMBER}
                        ${ActionsListIOTypes.BOOLEAN}
                        ${ActionsListIOTypes.OBJECT}
                    }

                    enum AvailableActionsName {
                        ${actionsListDomain
                            .getAvailableActions()
                            .map(a => a.name)
                            .join(' ')}
                    }

                    type ActionParam {
                        name: String!,
                        type: String!,
                        description: String
                    }

                    type Action {
                        name: AvailableActionsName!,
                        description: String,
                        inputTypes: [ActionIOTypes]!,
                        outputTypes: [ActionIOTypes]!,
                        params: [ActionParam]
                    }

                    type ActionConfiguration {
                        name: String!,
                        isSystem: Boolean!,
                        params: [ActionConfigurationParam]
                    }

                    type ActionsListConfiguration {
                        ${ActionsListEvents.SAVE_VALUE}: [ActionConfiguration]
                        ${ActionsListEvents.GET_VALUE}: [ActionConfiguration]
                        ${ActionsListEvents.DELETE_VALUE}: [ActionConfiguration]
                    }

                    input ActionsListConfigurationInput {
                        ${ActionsListEvents.SAVE_VALUE}: [ActionConfigurationInput]
                        ${ActionsListEvents.GET_VALUE}: [ActionConfigurationInput]
                        ${ActionsListEvents.DELETE_VALUE}: [ActionConfigurationInput]
                    }

                    input ActionConfigurationInput {
                        name: AvailableActionsName!,
                        params: [ActionConfigurationParamInput]
                    }

                    type ActionConfigurationParam {
                        name: String!,
                        value: String!
                    }

                    input ActionConfigurationParamInput {
                        name: String!,
                        value: String!
                    }

                    extend type Query {
                        availableActions: [Action!]
                    }
                `,
                resolvers: {
                    Query: {
                        async availableActions(parent, args) {
                            return actionsListDomain.getAvailableActions();
                        }
                    },
                    Mutation: {}
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
