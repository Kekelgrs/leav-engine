import {i18n} from 'i18next';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {
    AppPermissionsActions,
    AttributePermissionsActions,
    ILabeledPermissionsAction,
    IPermission,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IAppPermissionDomain} from './appPermissionDomain';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import getDefaultPermission from './helpers/getDefaultPermission';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {
    IGetActionsByTypeParams,
    IGetHeritedPermissionsParams,
    IGetPermissionsByActionsParams,
    IIsAllowedParams,
    PermByActionsRes
} from './_types';

export interface IPermissionDomain {
    savePermission(permData: IPermission, ctx: IQueryInfos): Promise<IPermission>;
    getPermissionsByActions({
        type,
        applyTo,
        actions,
        usersGroupId,
        permissionTreeTarget,
        ctx
    }: IGetPermissionsByActionsParams): Promise<PermByActionsRes>;

    /**
     * Retrieve herited permission: ignore permission defined on given element, force retrieval of herited permission
     */
    getHeritedPermissions({
        type,
        applyTo,
        action,
        userGroupId,
        permissionTreeTarget,
        ctx
    }: IGetHeritedPermissionsParams): Promise<boolean>;

    isAllowed({type, action, userId, applyTo, target, ctx}: IIsAllowedParams): Promise<boolean>;

    getActionsByType(params: IGetActionsByTypeParams): ILabeledPermissionsAction[];

    registerActions(type: PermissionTypes, actions: string[], applyOn?: string[]): void;
}

interface IDeps {
    'core.domain.permission.app'?: IAppPermissionDomain;
    'core.domain.permission.library'?: ILibraryPermissionDomain;
    'core.domain.permission.tree'?: ITreePermissionDomain;
    'core.domain.permission.record'?: IRecordPermissionDomain;
    'core.domain.permission.attribute'?: IAttributePermissionDomain;
    'core.infra.permission'?: IPermissionRepo;
    translator?: i18n;
    config?: IConfig;
}

export default function(deps: IDeps = {}): IPermissionDomain {
    const _pluginPermissions: {[type in PermissionTypes]?: Array<{name: string; applyOn?: string[]}>} = {};

    const {
        'core.domain.permission.app': appPermissionDomain = null,
        'core.domain.permission.record': recordPermissionDomain = null,
        'core.domain.permission.tree': treePermissionDomain = null,
        'core.domain.permission.library': libraryPermissionDomain = null,
        'core.domain.permission.attribute': attributePermissionDomain = null,
        'core.infra.permission': permissionRepo = null,
        config = null
    }: IDeps = deps;

    const savePermission = async (permData: IPermission, ctx: IQueryInfos): Promise<IPermission> => {
        // Does user have the permission to save permissions?
        const action = AppPermissionsActions.EDIT_PERMISSION;
        const canSavePermission = await appPermissionDomain.getAppPermission({
            action,
            userId: ctx.userId,
            ctx
        });

        if (!canSavePermission) {
            throw new PermissionError(action);
        }

        return permissionRepo.savePermission({permData, ctx});
    };

    const getPermissionsByActions = async (params: IGetPermissionsByActionsParams): Promise<PermByActionsRes> => {
        const {type, applyTo, actions, usersGroupId, permissionTreeTarget, ctx} = params;

        const perms = await permissionRepo.getPermissions({
            type,
            applyTo,
            usersGroupId,
            permissionTreeTarget,
            ctx
        });

        return actions.reduce((actionsPerms, action) => {
            actionsPerms[action] =
                perms !== null && typeof perms.actions[action] !== 'undefined' ? perms.actions[action] : null;

            return actionsPerms;
        }, {});
    };

    const getHeritedPermissions = async ({
        type,
        applyTo,
        action,
        userGroupId,
        permissionTreeTarget,
        ctx
    }: IGetHeritedPermissionsParams): Promise<boolean> => {
        let perm;
        switch (type) {
            case PermissionTypes.RECORD:
                perm = await recordPermissionDomain.getHeritedRecordPermission(
                    action as RecordPermissionsActions,
                    userGroupId,
                    applyTo,
                    permissionTreeTarget.tree,
                    {id: permissionTreeTarget.id, library: permissionTreeTarget.library},
                    ctx
                );
                break;
            case PermissionTypes.ATTRIBUTE:
                perm = treePermissionDomain.getHeritedTreePermission(
                    {
                        type: PermissionTypes.ATTRIBUTE,
                        applyTo,
                        action,
                        userGroupId,
                        permissionTreeTarget,
                        getDefaultPermission: () => getDefaultPermission(config)
                    },
                    ctx
                );
                break;
            case PermissionTypes.LIBRARY:
                action = action as LibraryPermissionsActions;
                perm = await libraryPermissionDomain.getHeritedLibraryPermission({
                    action,
                    libraryId: applyTo,
                    userGroupId,
                    ctx
                });
                break;
            case PermissionTypes.APP:
                action = action as AppPermissionsActions;
                perm = await appPermissionDomain.getHeritedAppPermission({
                    action,
                    userGroupId,
                    ctx
                });
                break;
        }

        return perm;
    };

    const isAllowed = async ({type, action, userId, applyTo, target, ctx}: IIsAllowedParams): Promise<boolean> => {
        let perm;
        switch (type) {
            case PermissionTypes.RECORD:
                if (!target || !target.recordId) {
                    throw new ValidationError({target: Errors.MISSING_RECORD_ID});
                }

                perm = await recordPermissionDomain.getRecordPermission(
                    action as RecordPermissionsActions,
                    userId,
                    applyTo,
                    target.recordId,
                    ctx
                );
                break;
            case PermissionTypes.ATTRIBUTE:
                const errors = [];
                if (!target) {
                    throw new ValidationError({target: Errors.MISSING_TARGET});
                }

                if (!target.recordId) {
                    errors.push('record ID');
                }

                if (!target.attributeId) {
                    errors.push('attribute ID');
                }

                if (errors.length) {
                    throw new ValidationError({
                        target: {msg: Errors.MISSING_FIELDS, vars: {fields: errors.join(', ')}}
                    });
                }

                perm = attributePermissionDomain.getAttributePermission(
                    action as AttributePermissionsActions,
                    userId,
                    target.attributeId,
                    applyTo,
                    target.recordId,
                    ctx
                );

                break;
            case PermissionTypes.LIBRARY:
                action = action as LibraryPermissionsActions;
                perm = await libraryPermissionDomain.getLibraryPermission({
                    action,
                    libraryId: applyTo,
                    userId,
                    ctx
                });
                break;
            case PermissionTypes.APP:
                action = action as AppPermissionsActions;
                perm = await appPermissionDomain.getAppPermission({
                    action,
                    userId,
                    ctx
                });
                break;
        }

        return perm;
    };

    const getActionsByType = ({
        type,
        applyOn,
        skipApplyOn = false
    }: IGetActionsByTypeParams): ILabeledPermissionsAction[] => {
        let perms;
        switch (type) {
            case PermissionTypes.APP:
                perms = Object.values(AppPermissionsActions);
                break;
            case PermissionTypes.LIBRARY:
                perms = Object.values(LibraryPermissionsActions);
                break;
            case PermissionTypes.ATTRIBUTE:
                perms = Object.values(AttributePermissionsActions);
                break;
            case PermissionTypes.RECORD:
                perms = Object.values(RecordPermissionsActions);
                break;
        }

        // Retrieve plugin permissions, applying filter if applyOn is specified
        const pluginPermissions = (_pluginPermissions[type] ?? [])
            .filter(p => skipApplyOn || !p.applyOn || p.applyOn.indexOf(applyOn) !== -1)
            .map(p => p.name);

        const res: ILabeledPermissionsAction[] = [...perms, ...pluginPermissions].map(p => ({
            name: p,
            label: config.lang.available.reduce(
                // Retrieve label for all available languages
                (acc, l) => ({
                    ...acc,
                    [l]: deps.translator.t(`permissions.${p}`, {lng: l})
                }),
                {}
            )
        }));

        return res;
    };

    const registerActions = (type: PermissionTypes, actions: string[], applyOn?: string[]) => {
        _pluginPermissions[type] = [...(_pluginPermissions[type] ?? []), ...actions.map(a => ({name: a, applyOn}))];
    };

    return {
        savePermission,
        getPermissionsByActions,
        getHeritedPermissions,
        isAllowed,
        getActionsByType,
        registerActions
    };
}
