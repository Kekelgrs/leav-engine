import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {IAttribute, IOAllowedTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import {getActionsListToSave, getAllowedInputTypes, getAllowedOutputTypes} from './helpers/attributeALHelper';
import {validateAttributeData} from './helpers/attributeValidationHelper';

export interface IAttributeDomain {
    getAttributeProperties({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<IAttribute>;

    /**
     * Get attributes list, filtered or not
     */
    getAttributes({}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<IAttribute>>;

    /**
     * Save attribute.
     * If attribute doesn't exist => create a new one, otherwise update existing
     */
    saveAttribute({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): Promise<IAttribute>;

    deleteAttribute({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<IAttribute>;

    getInputTypes({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): IOAllowedTypes;

    getOutputTypes({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): IOAllowedTypes;
}

interface IDeps {
    'core.infra.attribute'?: IAttributeRepo;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.utils'?: IUtils;
    'core.infra.tree'?: ITreeRepo;
    config?: any;
}

export default function({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.utils': utils = null,
    'core.infra.tree': treeRepo = null,
    config = null
}: IDeps = {}): IAttributeDomain {
    return {
        async getAttributeProperties({id, ctx}): Promise<IAttribute> {
            const attrs = await attributeRepo.getAttributes({
                params: {filters: {id}, strictFilters: true},
                ctx
            });

            if (!attrs.list.length) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }
            const props = attrs.list.pop();

            return props;
        },
        async getAttributes({params, ctx}): Promise<IList<IAttribute>> {
            // TODO: possibility to search multiple IDs
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return attributeRepo.getAttributes({params: initializedParams, ctx});
        },
        async saveAttribute({attrData, ctx}): Promise<IAttribute> {
            // TODO: Validate attribute data (linked library, linked tree...)

            const attrs = await attributeRepo.getAttributes({
                params: {filters: {id: attrData.id}, strictFilters: true},
                ctx
            });
            const isExistingAttr = !!attrs.list.length;

            const defaultParams = {
                _key: '',
                system: false,
                multiple_values: false,
                values_list: {
                    enable: false
                }
            };

            const attrProps: IAttribute = attrs.list[0] ?? null;
            const attrToSave = isExistingAttr
                ? {
                      ...defaultParams,
                      ...attrProps,
                      ...attrData
                  }
                : {...defaultParams, ...attrData};

            // Check permissions
            const action = isExistingAttr
                ? AdminPermissionsActions.EDIT_ATTRIBUTE
                : AdminPermissionsActions.CREATE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Add default actions list on new attribute
            attrToSave.actions_list = getActionsListToSave(attrToSave, attrProps, !isExistingAttr, utils);

            // Check settings validity
            const validationErrors = await validateAttributeData(
                attrToSave,
                {
                    utils,
                    treeRepo,
                    config,
                    attributeRepo,
                    actionsListDomain
                },
                ctx
            );

            if (Object.keys(validationErrors).length) {
                throw new ValidationError<IAttribute>(validationErrors);
            }

            const attr = isExistingAttr
                ? await attributeRepo.updateAttribute({attrData: attrToSave, ctx})
                : await attributeRepo.createAttribute({attrData: attrToSave, ctx});

            return attr;
        },
        async deleteAttribute({id, ctx}): Promise<IAttribute> {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_ATTRIBUTE;
            const canSavePermission = await permissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSavePermission) {
                throw new PermissionError(action);
            }

            // Get attribute
            const attr = await this.getAttributes({params: {filters: {id}}, ctx});

            // Check if exists and can delete
            if (!attr.list.length) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            const attrProps = attr.list.pop();

            if (attrProps.system) {
                throw new ValidationError<IAttribute>({id: Errors.SYSTEM_ATTRIBUTE_DELETION});
            }

            return attributeRepo.deleteAttribute({attrData: attrProps, ctx});
        },
        getInputTypes({attrData}): IOAllowedTypes {
            return getAllowedInputTypes(attrData);
        },
        getOutputTypes({attrData}): IOAllowedTypes {
            return getAllowedOutputTypes(attrData);
        }
    };
}
