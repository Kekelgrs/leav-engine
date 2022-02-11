// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IUtils} from 'utils/utils';
import {getEdgesCollectionName, getFullNodeId} from '../../infra/tree/helpers/utils';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {AttributeCondition, IRecord, IRecordFilterOption, IRecordSort} from '../../_types/record';
import {ITreeValue, IValue, IValueEdge} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo, IAttributeWithRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.utils'?: IUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.utils': utils = null
}: IDeps = {}): IAttributeTypeRepo {
    const _buildTreeValue = (
        treeId: string,
        nodeId: string,
        linkedRecord: IRecord,
        valueEdge: IValueEdge
    ): ITreeValue => {
        return {
            id_value: valueEdge._key,
            value: linkedRecord
                ? {
                      id: nodeId,
                      record: linkedRecord
                  }
                : null,
            attribute: valueEdge.attribute,
            modified_at: valueEdge.modified_at,
            modified_by: valueEdge.modified_by,
            created_at: valueEdge.created_at,
            created_by: valueEdge.created_by,
            version: valueEdge.version ?? null,
            metadata: valueEdge.metadata,
            treeId
        };
    };

    function _getExtendedFilterPart(attributes: IAttribute[], linkedValue: GeneratedAqlQuery): GeneratedAqlQuery {
        return aql`${
            attributes
                .map(a => a.id)
                .slice(2)
                .reduce((acc, value, i) => {
                    acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`${linkedValue}`})`);
                    if (i) {
                        acc.shift();
                    }
                    return acc;
                }, [])[0]
        }`;
    }

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<ITreeValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: getFullNodeId(value.value, attribute.linked_tree),
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                created_by: String(ctx.userId),
                modified_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<IValueEdge[]>({
                query: aql`
                    INSERT ${edgeData}
                        IN ${edgeCollec}
                    RETURN NEW`,
                ctx
            });
            const savedEdge = resEdge.length ? resEdge[0] : {};

            return _buildTreeValue(
                attribute.linked_tree,
                value.value,
                utils.decomposeValueEdgeDestination(value.value),
                savedEdge as IValueEdge
            );
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<ITreeValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: getFullNodeId(value.value, attribute.linked_tree),
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_by: value.created_by,
                modified_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<IValueEdge[]>({
                query: aql`
                    UPDATE ${{_key: String(value.id_value)}}
                        WITH ${edgeData}
                        IN ${edgeCollec}
                    RETURN NEW`,
                ctx
            });
            const savedEdge = resEdge.length ? resEdge[0] : {};

            return _buildTreeValue(
                attribute.linked_tree,
                value.value,
                utils.decomposeValueEdgeDestination(value.value),
                savedEdge as IValueEdge
            );
        },
        async deleteValue({attribute, value, ctx}): Promise<ITreeValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData = {
                _key: value.id_value
            };

            const resEdge = await dbService.execute<IValueEdge[]>({
                query: aql`
                    REMOVE ${edgeData} IN ${edgeCollec}
                    RETURN OLD`,
                ctx
            });
            const deletedEdge = resEdge.length ? resEdge[0] : {};

            return _buildTreeValue(
                attribute.linked_tree,
                value.value,
                utils.decomposeValueEdgeDestination((deletedEdge as IValueEdge)._to),
                deletedEdge as IValueEdge
            );
        },
        async getValues({
            library,
            recordId,
            attribute,
            forceGetAllValues = false,
            options,
            ctx
        }): Promise<ITreeValue[]> {
            if (!attribute.linked_tree) {
                return [];
            }

            const valuesLinksCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);
            const treeEdgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(attribute.linked_tree));

            const queryParts = [
                aql`
                FOR record, edge, path IN 2 OUTBOUND ${library + '/' + recordId}
                    ${valuesLinksCollec}, ${treeEdgeCollec}
                    PRUNE (IS_SAME_COLLECTION(${valuesLinksCollec}, edge) AND edge.attribute != ${attribute.id})
                    FILTER edge.toRecord
                `
            ];

            if (!forceGetAllValues && typeof options !== 'undefined' && options.version) {
                queryParts.push(aql`FILTER edge.version == ${options.version}`);
            }

            const limitOne = aql.literal(!attribute.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');
            queryParts.push(aql`
                ${limitOne}
                RETURN {id: SPLIT(edge._from, '/')[1], record, edge: path.edges[0]}
            `);

            const query = aql.join(queryParts);
            const treeElements = await dbService.execute({query, ctx});

            return treeElements.map(r => {
                r.record.library = r.record._id.split('/')[0];

                return _buildTreeValue(attribute.linked_tree, r.id, dbUtils.cleanup(r.record), r.edge);
            });
        },
        async getValueById({library, recordId, attribute, valueId, ctx}): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR linkedNode, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge._key == ${valueId}
                    FILTER edge.attribute == ${attribute.id}
                    LIMIT 1
                    RETURN {linkedNode, edge}
            `;

            const res = await dbService.execute({query, ctx});

            if (!res.length) {
                return null;
            }

            return _buildTreeValue(
                attribute.linked_tree,
                res[0].linkedNode._key,
                dbUtils.cleanup(res[0].linkedNode),
                res[0].edge
            );
        },
        sortQueryPart({attributes, order}: IRecordSort): AqlQuery {
            const valuesLinksCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);
            const treeCollec = dbService.db.edgeCollection(getEdgesCollectionName(attributes[0].linked_tree));

            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                ? {...attributes[1], id: '_key'}
                : attributes[1];

            // [record] ---(values links)---> [node] ---(tree link)---> [linked_record]
            // We just want to follow the path if the first edge matches our attribute, hence the PRUNE condition
            const linkedValue = aql`FIRST(
                FOR v, e IN 2 OUTBOUND r._id
                ${valuesLinksCollec}, ${treeCollec}
                PRUNE (IS_SAME_COLLECTION(${valuesLinksCollec}, e) AND e.attribute != ${attributes[0].id})
                RETURN v.${linked.id}
            )`;

            const query =
                linked.format !== AttributeFormats.EXTENDED
                    ? aql`SORT ${linkedValue} ${order}`
                    : aql`SORT ${_getExtendedFilterPart(attributes, linkedValue)} ${order}`;

            return query;
        },
        filterQueryPart(
            attributes: IAttributeWithRepo[],
            filter: IRecordFilterOption,
            parentIdentifier = BASE_QUERY_IDENTIFIER
        ): AqlQuery {
            const valuesLinksCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);
            const treeCollec = dbService.db.edgeCollection(getEdgesCollectionName(attributes[0].linked_tree));

            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                ? {...attributes[1], id: '_key'}
                : attributes[1];

            const linkIdentifier = parentIdentifier + 'v';
            const vIdentifier = aql.literal(linkIdentifier);
            const eIdentifier = aql.literal(parentIdentifier + 'e');

            const firstValuePrefix = aql`FIRST(`;
            // [record] ---(values links)---> [node] ---(tree link)---> [linked_record]
            // We just want to follow the path if the first edge matches our attribute, hence the PRUNE condition
            const retrieveValue = aql`
                FOR ${vIdentifier}, ${eIdentifier} IN 2 OUTBOUND ${aql.literal(parentIdentifier)}._id
                ${valuesLinksCollec}, ${treeCollec}
                PRUNE (IS_SAME_COLLECTION(${valuesLinksCollec}, ${eIdentifier}) AND ${eIdentifier}.attribute != ${
                attributes[0].id
            })`;
            const returnValue = aql`RETURN ${vIdentifier}`;
            const firstValueSuffix = aql`)`;

            let query: AqlQuery;
            const linkValIdentifier = aql.literal(`${parentIdentifier}linkVal`);
            if (
                [
                    AttributeCondition.VALUES_COUNT_EQUAL,
                    AttributeCondition.VALUES_COUNT_GREATER_THAN,
                    AttributeCondition.VALUES_COUNT_LOWER_THAN
                ].includes(filter.condition as AttributeCondition)
            ) {
                let conditionApplied;
                switch (filter.condition) {
                    case AttributeCondition.VALUES_COUNT_EQUAL:
                        conditionApplied = AttributeCondition.EQUAL;
                        break;
                    case AttributeCondition.VALUES_COUNT_GREATER_THAN:
                        conditionApplied = AttributeCondition.GREATER_THAN;
                        break;
                    case AttributeCondition.VALUES_COUNT_LOWER_THAN:
                        conditionApplied = AttributeCondition.LESS_THAN;
                        break;
                }

                query = aql.join([
                    aql`LET ${linkValIdentifier} = `,
                    aql`COUNT(`,
                    retrieveValue,
                    returnValue,
                    aql`)`,
                    aql`FILTER ${getConditionPart(linkValIdentifier, conditionApplied, filter.value, attributes[0])}`
                ]);
            } else if (
                filter.condition === AttributeCondition.IS_EMPTY ||
                filter.condition === AttributeCondition.IS_NOT_EMPTY
            ) {
                query = aql.join([
                    aql`LET ${linkValIdentifier} = `,
                    firstValuePrefix,
                    retrieveValue,
                    returnValue,
                    firstValueSuffix,
                    aql`FILTER ${getConditionPart(linkValIdentifier, filter.condition, filter.value, attributes[0])}`
                ]);
            } else {
                const filterValue = attributes[1]._repo.filterQueryPart(
                    [...attributes].splice(1),
                    filter,
                    linkIdentifier
                );

                const linkedValue = aql.join([
                    firstValuePrefix,
                    retrieveValue,
                    filterValue,
                    returnValue,
                    firstValueSuffix
                ]);

                query =
                    linked.format !== AttributeFormats.EXTENDED
                        ? aql`FILTER ${linkedValue} != null`
                        : aql`FILTER ${_getExtendedFilterPart(attributes, linkedValue)} != null`;
            }

            return query;
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            return true;
        }
    };
}
