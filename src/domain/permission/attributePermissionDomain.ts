import {IValueRepo} from 'infra/value/valueRepo';
import {AttributePermissionsActions, PermissionTypes} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from './permissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

export interface IAttributePermissionDomain {
    getAttributePermission(
        action: AttributePermissionsActions,
        userGroupId: number,
        attributeId: string,
        recordLibrary: string,
        recordId: number
    ): Promise<boolean>;
}

export default function(
    permissionDomain: IPermissionDomain,
    treePermissionDomain: ITreePermissionDomain,
    attributeDomain: IAttributeDomain,
    valueRepo: IValueRepo
): IAttributePermissionDomain {
    return {
        async getAttributePermission(
            action: AttributePermissionsActions,
            userId: number,
            attributeId: string,
            recordLibrary: string,
            recordId: number
        ): Promise<boolean> {
            const attrProps = await attributeDomain.getAttributeProperties(attributeId);
            if (typeof attrProps.permissions_conf === 'undefined') {
                return permissionDomain.getDefaultPermission();
            }

            const treesAttrValues = await Promise.all(
                attrProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
                    return valueRepo.getValues(recordLibrary, recordId, permTreeAttrProps);
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[attrProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = treePermissionDomain.getTreePermission({
                type: PermissionTypes.ATTRIBUTE,
                action,
                userId,
                applyTo: attributeId,
                treeValues: valuesByAttr,
                permissions_conf: attrProps.permissions_conf,
                getDefaultPermission: permissionDomain.getDefaultPermission
            });

            return perm;
        }
    };
}
