// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
    LibraryInput,
    AvailableLanguage,
    LibraryBehavior,
    AttributeType,
    AttributeFormat,
    PermissionsRelation,
    ValueVersionMode
} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_LIBRARY
// ====================================================

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute_versions_conf | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_linked_library {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_versions_conf | null;
    linked_library: SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_versions_conf | null;
    linked_tree: SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_saveLibrary_attributes =
    | SAVE_LIBRARY_saveLibrary_attributes_StandardAttribute
    | SAVE_LIBRARY_saveLibrary_attributes_LinkAttribute
    | SAVE_LIBRARY_saveLibrary_attributes_TreeAttribute;

export interface SAVE_LIBRARY_saveLibrary_fullTextAttributes {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
    label: SystemTranslation | null;
}

export type SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_saveLibrary_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_saveLibrary_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_saveLibrary_recordIdentityConf {
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface SAVE_LIBRARY_saveLibrary_defaultView {
    id: string;
}

export interface SAVE_LIBRARY_saveLibrary_gqlNames {
    query: string;
    type: string;
    list: string;
    filter: string;
    searchableFields: string;
}

export interface SAVE_LIBRARY_saveLibrary {
    id: string;
    system: boolean | null;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    attributes: SAVE_LIBRARY_saveLibrary_attributes[] | null;
    fullTextAttributes: SAVE_LIBRARY_saveLibrary_fullTextAttributes[] | null;
    permissions_conf: SAVE_LIBRARY_saveLibrary_permissions_conf | null;
    recordIdentityConf: SAVE_LIBRARY_saveLibrary_recordIdentityConf | null;
    defaultView: SAVE_LIBRARY_saveLibrary_defaultView | null;
    gqlNames: SAVE_LIBRARY_saveLibrary_gqlNames;
}

export interface SAVE_LIBRARY {
    saveLibrary: SAVE_LIBRARY_saveLibrary;
}

export interface SAVE_LIBRARYVariables {
    libData: LibraryInput;
    lang?: AvailableLanguage[] | null;
}
