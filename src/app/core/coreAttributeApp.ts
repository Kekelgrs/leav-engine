import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreApp} from './coreApp';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    getGraphQLFormat(attribute: IAttribute): string;
}

export default function(
    attributeDomain: IAttributeDomain,
    graphqlApp: IGraphqlApp,
    coreApp: ICoreApp
): ICoreAttributeApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const attributes = await attributeDomain.getAttributes();

            const baseSchema = {
                typeDefs: `
                    enum AttributeType {
                        ${Object.values(AttributeTypes).join(' ')}
                    }

                    enum AttributeFormat {
                        ${Object.values(AttributeFormats).join(' ')}
                    }

                    # Application Attribute
                    type Attribute {
                        id: ID!,
                        type: AttributeType!,
                        format: AttributeFormat,
                        system: Boolean!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttribute],
                        actions_list: ActionsListConfiguration,
                        permissionsConf: TreePermissionsConf,
                        multipleValues: Boolean
                    }

                    input AttributeInput {
                        id: ID!
                        type: AttributeType!
                        format: AttributeFormat
                        label: SystemTranslationInput,
                        linked_library: String,
                        linked_tree: String,
                        embedded_fields: [EmbeddedAttributeInput],
                        actions_list: ActionsListConfigurationInput,
                        permissionsConf: TreePermissionsConfInput,
                        multipleValues: Boolean
                    }

                    type EmbeddedAttribute {
                        id: ID!,
                        format: AttributeFormat,
                        label: SystemTranslation,
                        validation_regex: String,
                        embedded_fields: [EmbeddedAttribute]
                    }

                    input EmbeddedAttributeInput {
                        id: ID!
                        format: AttributeFormat
                        label: SystemTranslationInput,
                        validation_regex: String,
                        embedded_fields: [EmbeddedAttributeInput]
                    }

                    extend type Query {
                        attributes(
                            id: ID,
                            type: [AttributeType],
                            format: [AttributeFormat],
                            label: String,
                            system: Boolean,
                            multipleValues: Boolean
                        ): [Attribute!]
                    }

                    extend type Mutation {
                        saveAttribute(attribute: AttributeInput): Attribute!
                        deleteAttribute(id: ID): Attribute!
                    }
                `,
                resolvers: {
                    Query: {
                        async attributes(parent, args) {
                            return attributeDomain.getAttributes(args);
                        }
                    },
                    Mutation: {
                        async saveAttribute(parent, {attribute}, ctx): Promise<IAttribute> {
                            const savedAttr = await attributeDomain.saveAttribute(
                                attribute,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );
                            graphqlApp.generateSchema();

                            return savedAttr;
                        },
                        async deleteAttribute(parent, {id}, ctx): Promise<IAttribute> {
                            const deletedAttr = await attributeDomain.deleteAttribute(
                                id,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );
                            graphqlApp.generateSchema();

                            return deletedAttr;
                        }
                    },
                    Attribute: {
                        /**
                         * Return attribute label, potentially filtered by requested language
                         */
                        label: async (attributeData, args) => {
                            return coreApp.filterSysTranslationField(attributeData.label, args.lang || []);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        getGraphQLFormat(attribute: IAttribute): string {
            if (attribute.id === 'id') {
                return 'ID!';
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                return 'linkValue';
            } else if (attribute.type === AttributeTypes.TREE) {
                return 'treeValue';
            } else {
                return 'Value';
            }
        }
    };
}
