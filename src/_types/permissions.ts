export enum PermissionTypes {
    RECORD = 'record',
    ATTRIBUTE = 'attribute',
    ADMIN = 'admin'
}

export enum RecordPermissionsActions {
    ACCESS = 'access',
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum AttributePermissionsActions {
    ACCESS_ATTRIBUTE = 'access_attribute',
    CREATE_VALUE = 'create_value',
    EDIT_VALUE = 'edit_value',
    DELETE_VALUE = 'delete_value'
}

export enum AdminPermisisonsActions {
    CREATE_LIBRARY = 'create_library',
    EDIT_LIBRARY = 'edit_library',
    DELETE_LIBRARY = 'delete_library',
    CREATE_ATTRIBUTE = 'create_attribute',
    EDIT_ATTRIBUTE = 'edit_attribute',
    DELETE_ATTRIBUTE = 'delete_attribute',
    CREATE_TREE = 'create_tree',
    EDIT_TREE = 'edit_tree',
    DELETE_TREE = 'delete_tree',
    EDIT_PERMISSION = 'edit_permission'
}

export type PermissionsActions = RecordPermissionsActions | AttributePermissionsActions | AdminPermisisonsActions;

export enum PermissionsRelations {
    AND = 'and',
    OR = 'or'
}

export interface ITreePermissionsConf {
    /**
     * IDs of attributes used for permissions
     */
    permissionTreeAttributes: string[];

    /**
     * Relation between those trees when retrieving permission
     */
    relation: PermissionsRelations;
}

export interface IPermissionsTreeTarget {
    /**
     * Tree ID
     */
    tree: string;

    /**
     * Tree element's library
     */
    library: string;

    /**
     * Tree element's ID
     */
    id: string | number;
}

export interface IPermission {
    /**
     * Permission type
     */
    type: PermissionTypes;

    /**
     * What this permission applies to? Can be a library, an attribute...
     */
    applyTo?: string;

    /**
     * Users group concerned by this permission
     */
    usersGroup: string;

    /**
     * Permission by action: create, edit...
     * Set an action to null to herit from its parent when using in a record or attribute permission
     */
    actions: {[name: string]: boolean | null};

    /**
     * What element on permissions tree is concerned by this permission
     */
    permissionTreeTarget?: IPermissionsTreeTarget;
}
