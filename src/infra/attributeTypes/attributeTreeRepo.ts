import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IValue} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IAttributeTypeRepo} from './attributeTypesRepo';

const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}
export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): IAttributeTypeRepo {
    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: value.value,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at
            };

            if (value.version) {
                edgeData.version = dbUtils.convertValueVersionToDb(value.version);
            }

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute({
                query: aql`
                    INSERT ${edgeData}
                        IN ${edgeCollec}
                    RETURN NEW`,
                ctx
            });
            const savedEdge = resEdge.length ? resEdge[0] : {};

            const res: IValue = {
                id_value: savedEdge._key,
                value: savedEdge._to,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                version: savedEdge.version,
                metadata: savedEdge.metadata
            };

            if (value.version) {
                res.version = dbUtils.convertValueVersionFromDb(savedEdge.version);
            }

            return res;
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: value.value,
                attribute: attribute.id,
                modified_at: value.modified_at
            };

            if (value.version) {
                edgeData.version = dbUtils.convertValueVersionToDb(value.version);
            }

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute({
                query: aql`
                    UPDATE ${{_key: value.id_value}}
                        WITH ${edgeData}
                        IN ${edgeCollec}
                    RETURN NEW`,
                ctx
            });
            const savedEdge = resEdge.length ? resEdge[0] : {};

            const res: IValue = {
                id_value: savedEdge._key,
                value: savedEdge._to,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                version: savedEdge.version,
                metadata: savedEdge.metadata
            };

            if (value.version) {
                res.version = dbUtils.convertValueVersionFromDb(savedEdge.version);
            }

            return res;
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData = {
                _key: value.id_value
            };

            const deletedEdge = await edgeCollec.removeByExample(edgeData);

            return {
                id_value: value.id_value
            };
        },
        async getValues({library, recordId, attribute, forceGetAllValues = false, options, ctx}): Promise<IValue[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const queryParts = [
                aql`
                FOR linkedRecord, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge.attribute == ${attribute.id}
                `
            ];

            if (!forceGetAllValues && typeof options !== 'undefined' && options.version) {
                queryParts.push(aql`FILTER edge.version == ${options.version}`);
            }

            const limitOne = aql.literal(!attribute.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');
            queryParts.push(aql`
                ${limitOne}
                RETURN {linkedRecord, edge}
            `);

            const query = aql.join(queryParts);
            const treeElements = await dbService.execute({query, ctx});

            return treeElements.map(r => {
                r.linkedRecord.library = r.linkedRecord._id.split('/')[0];

                return {
                    id_value: Number(r.edge._key),
                    value: {record: dbUtils.cleanup(r.linkedRecord)},
                    attribute: r.edge.attribute,
                    modified_at: r.edge.modified_at,
                    created_at: r.edge.created_at,
                    metadata: r.edge.metadata
                };
            });
        },
        async getValueById({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR linkedRecord, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge._key == ${value.id_value}
                    FILTER edge.attribute == ${attribute.id}
                    LIMIT 1
                    RETURN {linkedRecord, edge}
            `;

            const res = await dbService.execute({query, ctx});

            if (!res.length) {
                return null;
            }

            return {
                id_value: Number(res[0].edge._key),
                value: dbUtils.cleanup(res[0].linkedRecord),
                attribute: res[0].edge.attribute,
                modified_at: res[0].edge.modified_at,
                created_at: res[0].edge.created_at,
                metadata: res[0].edge.metadata
            };
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            return null;
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            return true;
        }
    };
}
