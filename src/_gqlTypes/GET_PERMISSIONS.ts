/* tslint:disable */
// This file was automatically generated and should not be edited.

import {PermissionTypes, PermissionsActions, PermissionsTreeTargetInput} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_PERMISSIONS
// ====================================================

export interface GET_PERMISSIONS_perm {
    name: PermissionsActions;
    allowed: boolean | null;
}

export interface GET_PERMISSIONS_heritPerm {
    name: PermissionsActions;
    allowed: boolean;
}

export interface GET_PERMISSIONS {
    perm: GET_PERMISSIONS_perm[] | null;
    heritPerm: GET_PERMISSIONS_heritPerm[] | null;
}

export interface GET_PERMISSIONSVariables {
    type: PermissionTypes;
    applyTo?: string | null;
    actions: PermissionsActions[];
    usersGroup?: string | null;
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
}
