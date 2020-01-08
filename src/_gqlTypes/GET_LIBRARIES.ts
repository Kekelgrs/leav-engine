/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
    AvailableLanguage,
    LibraryBehavior,
    AttributeType,
    AttributeFormat,
    PermissionsRelation,
    ValueVersionMode
} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARIES
// ====================================================

export interface GET_LIBRARIES_libraries_list_attributes_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_permissions_conf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_attributes_permissions_conf {
    permissionTreeAttributes: GET_LIBRARIES_libraries_list_attributes_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_list_attributes_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_LIBRARIES_libraries_list_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    linked_library: string | null;
    linked_tree: string | null;
    multiple_values: boolean;
    metadata_fields: GET_LIBRARIES_libraries_list_attributes_metadata_fields[] | null;
    permissions_conf: GET_LIBRARIES_libraries_list_attributes_permissions_conf | null;
    versions_conf: GET_LIBRARIES_libraries_list_attributes_versions_conf | null;
}

export interface GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_list_permissions_conf {
    permissionTreeAttributes: GET_LIBRARIES_libraries_list_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_list_recordIdentityConf {
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface GET_LIBRARIES_libraries_list_gqlNames {
    query: string;
    type: string;
    list: string;
    filter: string;
    searchableFields: string;
}

export interface GET_LIBRARIES_libraries_list {
    id: string;
    system: boolean | null;
    label: any | null;
    behavior: LibraryBehavior;
    attributes: GET_LIBRARIES_libraries_list_attributes[] | null;
    permissions_conf: GET_LIBRARIES_libraries_list_permissions_conf | null;
    recordIdentityConf: GET_LIBRARIES_libraries_list_recordIdentityConf | null;
    gqlNames: GET_LIBRARIES_libraries_list_gqlNames;
}

export interface GET_LIBRARIES_libraries {
    totalCount: number;
    list: GET_LIBRARIES_libraries_list[];
}

export interface GET_LIBRARIES {
    libraries: GET_LIBRARIES_libraries | null;
}

export interface GET_LIBRARIESVariables {
    id?: string | null;
    label?: string | null;
    system?: boolean | null;
    lang?: AvailableLanguage[] | null;
}
