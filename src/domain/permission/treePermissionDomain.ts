import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ITreeNode} from '_types/tree';
import {
    ITreePermissionsConf,
    PermissionsActions,
    PermissionsRelations,
    PermissionTypes
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from './permissionDomain';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams): Promise<boolean>;
}

export interface IGetTreePermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userId: number;
    applyTo: string;
    treeValues: {[treeAttributeId: string]: ITreeNode[]};
    permissionsConf: ITreePermissionsConf;
    getDefaultPermission: (action?: any, applyTo?: string, userId?: number) => Promise<boolean> | boolean;
}

export default function(
    permissionDomain: IPermissionDomain,
    treeRepo: ITreeRepo,
    attributeDomain: IAttributeDomain,
    valueRepo: IValueRepo
): ITreePermissionDomain {
    /**
     * Return permission for given permission tree attribute.
     * Get record's value on this tree attribute, then run through its ancestors to look for any permission defined
     *
     * @param action
     * @param recordLibrary
     * @param recordId
     * @param permTreeAttr
     * @param userGroupsPaths
     */
    async function _getPermTreePermission(
        type: PermissionTypes,
        action: PermissionsActions,
        applyTo: string,
        userGroupsPaths: ITreeNode[][],
        permTreeId: string,
        permTreeVal: ITreeNode[]
    ): Promise<boolean> {
        if (permTreeVal.length) {
            const permTreePath = await treeRepo.getElementAncestors(permTreeId, {
                id: permTreeVal[0].record.id,
                library: permTreeVal[0].record.library
            });

            for (const treeElem of permTreePath.slice().reverse()) {
                const perm = await permissionDomain.getPermissionByUserGroups(type, action, userGroupsPaths, applyTo, {
                    id: treeElem.record.id,
                    library: treeElem.record.library,
                    tree: permTreeId
                });

                if (perm !== null) {
                    return perm;
                }
            }
        }

        // No permission found, return default permission
        return null;
    }

    return {
        async getTreePermission(params: IGetTreePermissionParams): Promise<boolean> {
            const {type, action, userId, applyTo, treeValues, permissionsConf, getDefaultPermission} = params;

            if (!permissionsConf.permissionTreeAttributes.length) {
                return getDefaultPermission();
            }

            const userGroupAttr = await attributeDomain.getAttributeProperties('user_groups');

            // Get user group, retrieve ancestors
            const userGroups = await valueRepo.getValues('users', userId, userGroupAttr);
            const userGroupsPaths = await Promise.all(
                userGroups.map(userGroupVal =>
                    treeRepo.getElementAncestors('users_groups', {
                        id: userGroupVal.value.record.id,
                        library: 'users_groups'
                    })
                )
            );

            const treePerms = await Promise.all(
                permissionsConf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
                    const treePerm = await _getPermTreePermission(
                        type,
                        action,
                        applyTo,
                        userGroupsPaths,
                        permTreeAttrProps.linked_tree,
                        treeValues[permTreeAttr]
                    );

                    if (treePerm !== null) {
                        return treePerm;
                    }

                    return getDefaultPermission(action, applyTo, userId);
                })
            );

            const perm = treePerms.reduce((globalPerm, treePerm) => {
                if (globalPerm === null) {
                    return treePerm;
                }

                return permissionsConf.relation === PermissionsRelations.AND
                    ? globalPerm && treePerm
                    : globalPerm || treePerm;
            }, null);

            return perm;
        }
    };
}
