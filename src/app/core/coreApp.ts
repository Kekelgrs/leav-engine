import {merge} from 'lodash';
import {ILibraryDomain, ILibrary} from 'domain/libraryDomain';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IAttributeDomain, IAttribute} from 'domain/attributeDomain';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(libraryDomain: ILibraryDomain, attributeDomain: IAttributeDomain, config: any): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type SystemTranslation {
                        ${config.lang.available.map(l => `${l}: String`)}
                    }

                    input SystemTranslationInput {
                        ${config.lang.available.map(l => `${l}: String${l === config.lang.default ? '!' : ''}`)}
                    }

                    # Application Library
                    type Library {
                        id: String,
                        system: Boolean,
                        label: SystemTranslation
                    }

                    # Application Attribute
                    type Attribute {
                        id: String,
                        type: String,
                        format: String,
                        system: Boolean,
                        label: SystemTranslation
                    }

                    input LibraryInput {
                        id: String!
                        label: SystemTranslationInput
                    }

                    input AttributeInput {
                        id: String!
                        type: String!
                        format: String
                        label: SystemTranslationInput
                    }

                    type Query {
                        libraries(id: String): [Library]
                        attributes(id: String): [Attribute]
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library
                        deleteLibrary(id: String): Library
                        saveAttribute(attribute: AttributeInput): Attribute
                        deleteAttribute(id: String): Attribute
                    }
                `,
                resolvers: {
                    Query: {
                        async libraries(parent, args) {
                            return libraryDomain.getLibraries();
                        },
                        async attributes(parent, args) {
                            return attributeDomain.getAttributes();
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}): Promise<ILibrary> {
                            return libraryDomain.saveLibrary(library);
                        },
                        async deleteLibrary(parent, {id}): Promise<ILibrary> {
                            return libraryDomain.deleteLibrary(id);
                        },
                        async saveAttribute(parent, {attribute}): Promise<IAttribute> {
                            return attributeDomain.saveAttribute(attribute);
                        },
                        async deleteAttribute(parent, {id}): Promise<IAttribute> {
                            return attributeDomain.deleteAttribute(id);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
