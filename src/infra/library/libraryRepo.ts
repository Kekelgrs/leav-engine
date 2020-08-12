import {aql} from 'arangojs';
import {difference} from 'lodash';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IAttribute} from '../../_types/attribute';
import {ILibrary} from '../../_types/library';
import {IList} from '../../_types/list';
import {IAttributeRepo, ATTRIB_COLLECTION_NAME} from '../attribute/attributeRepo';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IQueryInfos} from '_types/queryInfos';
import {IEvent, EventType} from '../../_types/event';
import {IAmqpService} from '../amqp/amqpService';
import * as Config from '_types/config';

const LIB_COLLECTION_NAME = 'core_libraries';
export const LIB_ATTRIB_COLLECTION_NAME = 'core_edge_libraries_attributes';

export interface ILibraryRepo {
    /**
     * Return libraries
     *
     * filters                   Filters libraries returned
     *
     * @return Promise<Array<object>>   All libraries data
     */
    getLibraries({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ILibrary>>;

    /**
     * Create new library
     *
     * @return Promise<object>  New library data
     */
    createLibrary({libData, ctx}: {libData: ILibrary; ctx: IQueryInfos}): Promise<ILibrary>;

    /**
     * Update existing library
     *
     * libData   Must contain "id" key to identify library to update
     *
     * @return object   Updated library data
     */
    updateLibrary({libData, ctx}: {libData: ILibrary; ctx: IQueryInfos}): Promise<ILibrary>;

    /**
     * Delete library
     *
     * @return {}   Deleted library data
     */
    deleteLibrary({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<ILibrary>;

    /**
     * Link attributes to library
     *
     * attributes Array of attributes IDs
     *
     * @return array     List of linked attributes
     */
    saveLibraryAttributes({
        libId,
        attributes,
        ctx
    }: {
        libId: string;
        attributes: string[];
        ctx: IQueryInfos;
    }): Promise<string[]>;

    /**
     * Upsert full text attributes to library
     *
     * fullTextAttributes Array of full text attributes IDs
     *
     */
    saveLibraryFullTextAttributes({
        libId,
        fullTextAttributes,
        ctx
    }: {
        libId: string;
        fullTextAttributes: string[];
        ctx: IQueryInfos;
    }): Promise<void>;

    getLibraryAttributes({libId, ctx}: {libId: string; ctx: IQueryInfos}): Promise<IAttribute[]>;
    getLibraryFullTextAttributes({libId, ctx}: {libId: string; ctx: IQueryInfos}): Promise<IAttribute[]>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.amqp.amqpService'?: IAmqpService;
}

export default function({
    config = null,
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.amqp.amqpService': amqpService = null
}: IDeps = {}): ILibraryRepo {
    return {
        async getLibraries({params = {}, ctx}): Promise<IList<ILibrary>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };

            const initializedParams = {...defaultParams, ...params};
            const libraries = await dbUtils.findCoreEntity<ILibrary>({
                ...initializedParams,
                collectionName: LIB_COLLECTION_NAME,
                ctx
            });

            return libraries;
        },
        async createLibrary({libData, ctx}): Promise<ILibrary> {
            const docToInsert = dbUtils.convertToDoc(libData);

            // Create new collection for library
            await dbService.createCollection(docToInsert._key);

            // Insert in libraries collection
            const libCollc = dbService.db.collection(LIB_COLLECTION_NAME);
            const libRes = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${libCollc} RETURN NEW`,
                ctx
            });

            // sending indexation event
            const indexationMsg: IEvent = {
                date: new Date(),
                userId: ctx.userId,
                payload: {
                    type: EventType.LIBRARY_CREATE,
                    data: {
                        id: libRes[0]._key
                    }
                }
            };
            await amqpService.publish(config.indexationManager.routingKeys.events, JSON.stringify(indexationMsg));

            return dbUtils.cleanup(libRes.pop());
        },
        async updateLibrary({libData, ctx}): Promise<ILibrary> {
            const docToInsert = dbUtils.convertToDoc(libData);
            delete docToInsert.attributes; // Attributes have to be handled separately

            // Insert in libraries collection
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async deleteLibrary({id, ctx}): Promise<ILibrary> {
            // Delete attributes linked to this library
            const linkedAttributes = await attributeRepo.getAttributes({
                params: {filters: {linked_library: id}},
                ctx
            });

            for (const linkedAttribute of linkedAttributes.list) {
                await attributeRepo.deleteAttribute({
                    attrData: linkedAttribute,
                    ctx
                });
            }

            // Delete library attributes
            const libAttributesCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            await dbService.execute({
                query: aql`FOR e IN ${libAttributesCollec}
                         FILTER e._from == ${LIB_COLLECTION_NAME + '/' + id}
                         REMOVE e IN ${libAttributesCollec}`,
                ctx
            });

            // Delete library
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: id}} IN ${col} RETURN OLD`,
                ctx
            });

            // Delete library's collection
            await dbService.dropCollection(id);

            // sending indexation event
            const indexationMsg: IEvent = {
                date: new Date(),
                userId: ctx.userId,
                payload: {
                    type: EventType.LIBRARY_DELETE,
                    data: {id}
                }
            };
            await amqpService.publish(config.indexationManager.routingKeys.events, JSON.stringify(indexationMsg));

            // Return deleted library
            return dbUtils.cleanup(res.pop());
        },
        async saveLibraryAttributes({libId, attributes, ctx}): Promise<string[]> {
            // TODO: in CONCAT, query will fail is using constant instead of hard coding 'core_attributes'
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // Get current library attributes
            const currentAttrs = await this.getLibraryAttributes({libId, ctx});
            const deletedAttrs = difference(
                currentAttrs.filter(a => !a.system).map(a => a.id),
                attributes
            );

            // Unlink attributes not used anymore
            if (deletedAttrs.length) {
                await dbService.execute({
                    query: aql`
                        FOR attr IN ${deletedAttrs}
                            FOR l in ${libAttribCollec}
                                FILTER
                                    l._from == ${LIB_COLLECTION_NAME + '/' + libId}
                                    AND l._to == CONCAT('core_attributes/', attr)
                                REMOVE l
                                IN ${libAttribCollec}
                                RETURN OLD
                    `,
                    ctx
                });
            }

            // Save new ones
            const libAttribRes = await dbService.execute({
                query: aql`
                    FOR attr IN ${attributes}
                        LET attrToInsert = {
                            _from: ${LIB_COLLECTION_NAME + '/' + libId},
                            _to: CONCAT('core_attributes/', attr)
                        }
                        UPSERT {
                            _from: ${LIB_COLLECTION_NAME + '/' + libId},
                            _to: CONCAT('core_attributes/', attr)
                        }
                        INSERT attrToInsert
                        UPDATE attrToInsert
                        IN ${libAttribCollec}
                        RETURN NEW
                `,
                ctx
            });

            return libAttribRes.map(res => res._to.split('/')[1]);
        },
        async getLibraryAttributes({libId, ctx}): Promise<IAttribute[]> {
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // TODO: use aql template tag, and find out why it doesn't work :)
            const query = `
                FOR v
                IN 1 OUTBOUND '${LIB_COLLECTION_NAME}/${libId}'
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(dbUtils.cleanup);
        },
        async saveLibraryFullTextAttributes({libId, fullTextAttributes, ctx}): Promise<void> {
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            await dbService.execute({
                query: aql`
                    FOR attr IN ${libAttribCollec}
                        FILTER attr._from == ${LIB_COLLECTION_NAME + '/' + libId}
                        UPDATE {
                            _key: attr._key,
                            full_text_search: POSITION(${fullTextAttributes}, LAST(SPLIT(attr._to, '/')))
                        }
                        IN ${libAttribCollec}
                `,
                ctx
            });

            // sending indexation event
            const indexationMsg: IEvent = {
                date: new Date(),
                userId: ctx.userId,
                payload: {
                    type: EventType.LIBRARY_ATTRIBUTES_UPDATE,
                    data: {
                        id: libId,
                        fullTextAttributes
                    }
                }
            };

            await amqpService.publish(config.indexationManager.routingKeys.events, JSON.stringify(indexationMsg));
        },
        async getLibraryFullTextAttributes({libId, ctx}): Promise<IAttribute[]> {
            const libAttributesCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);
            const attributesCollec = dbService.db.edgeCollection(ATTRIB_COLLECTION_NAME);

            const attrs = await dbService.execute({
                query: aql`LET fullTextAttrs = (
                            FOR e IN ${libAttributesCollec}
                                FILTER e._from == ${LIB_COLLECTION_NAME + '/' + libId}
                                FILTER e.full_text_search == true
                            RETURN LAST(SPLIT(e._to, '/'))
                        )
                        FOR a IN ${attributesCollec}
                            FILTER POSITION(fullTextAttrs, a._key)
                        RETURN a
                    `,
                ctx
            });

            return attrs.map(dbUtils.cleanup);
        }
    };
}
