// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IUtils} from 'utils/utils';
import {ILinkValue, IValueEdge} from '_types/value';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {AttributeCondition, IRecord, IRecordFilterOption, IRecordSort} from '../../_types/record';
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

    const _buildLinkValue = (linkedRecord: IRecord, valueEdge: IValueEdge): ILinkValue => {
        return {
            id_value: valueEdge._key,
            value: linkedRecord,
            attribute: valueEdge.attribute,
            modified_at: valueEdge.modified_at,
            modified_by: valueEdge.modified_by,
            created_at: valueEdge.created_at,
            created_by: valueEdge.created_by,
            version: valueEdge.version ? dbUtils.convertValueVersionFromDb(valueEdge.version) : null,
            metadata: valueEdge.metadata
        };
    };

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<ILinkValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: attribute.linked_library + '/' + value.value,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                created_by: String(ctx.userId),
                modified_by: String(ctx.userId)
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

            return _buildLinkValue(utils.decomposeValueEdgeDestination(savedEdge._to), savedEdge);
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<ILinkValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: attribute.linked_library + '/' + value.value,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_by: value.created_by,
                modified_by: String(ctx.userId)
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

            return _buildLinkValue(utils.decomposeValueEdgeDestination(savedEdge._to), savedEdge);
        },
        async deleteValue({value, ctx}): Promise<ILinkValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData = {
                _key: value.id_value
            };

            const resEdge = await dbService.execute({
                query: aql`
                    REMOVE ${edgeData} IN ${edgeCollec}
                    RETURN OLD`,
                ctx
            });
            const deletedEdge = resEdge.length ? resEdge[0] : {};

            return _buildLinkValue(utils.decomposeValueEdgeDestination(deletedEdge._to), deletedEdge);
        },
        async getValues({
            library,
            recordId,
            attribute,
            forceGetAllValues = false,
            options,
            ctx
        }): Promise<ILinkValue[]> {
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
            const res = await dbService.execute({query, ctx});

            return res.map(r => _buildLinkValue(dbUtils.cleanup(r.linkedRecord), r.edge));
        },
        async getValueById({library, recordId, attribute, valueId, ctx}): Promise<ILinkValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR linkedRecord, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge._key == ${valueId}
                    FILTER edge.attribute == ${attribute.id}
                    LIMIT 1
                    RETURN {linkedRecord, edge}
            `;

            const res = await dbService.execute({query, ctx});

            if (!res.length) {
                return null;
            }

            return _buildLinkValue(dbUtils.cleanup(res[0].edge.linkedRecord), res[0].edge);
        },
        sortQueryPart({attributes, order}: IRecordSort): AqlQuery {
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                ? {...attributes[1], id: '_key'}
                : attributes[1];

            const linkedValue = aql`FIRST(
                FOR v, e IN 1 OUTBOUND r._id
                ${collec}
                FILTER e.attribute == ${attributes[0].id} RETURN v.${linked.id}
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
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                ? {...attributes[1], id: '_key'}
                : attributes[1];

            const linkIdentifier = parentIdentifier + 'v';
            const vIdentifier = aql.literal(linkIdentifier);
            const eIdentifier = aql.literal(parentIdentifier + 'e');

            const firstValuePrefix = aql`FIRST(`;
            const getValuePart = aql`
                FOR ${vIdentifier}, ${eIdentifier} IN 1 OUTBOUND ${aql.literal(parentIdentifier)}._id
                ${collec}
                FILTER ${eIdentifier}.attribute == ${attributes[0].id}
            `;
            const getValueReturnPart = aql`RETURN ${vIdentifier}`;
            const firstValueSuffix = aql`)`;

            let query: AqlQuery;
            if (
                filter.condition === AttributeCondition.IS_EMPTY ||
                filter.condition === AttributeCondition.IS_NOT_EMPTY
            ) {
                const linkValIdentifier = aql.literal(`${parentIdentifier}linkVal`);
                query = aql.join([
                    aql`LET ${linkValIdentifier} = `,
                    firstValuePrefix,
                    getValuePart,
                    getValueReturnPart,
                    firstValueSuffix,
                    aql`FILTER ${getConditionPart(linkValIdentifier, filter.condition, filter.value, attributes[0])}`
                ]);
            } else {
                const filterLinkedValue = attributes[1]
                    ? attributes[1]._repo.filterQueryPart([...attributes].splice(1), filter, linkIdentifier)
                    : null;
                const linkedValue = aql.join([
                    firstValuePrefix,
                    getValuePart,
                    filterLinkedValue,
                    getValueReturnPart,
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
