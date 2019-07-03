/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES
// ====================================================

export interface GET_ATTRIBUTES_attributes_permissionsConf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface GET_ATTRIBUTES_attributes_permissionsConf {
    permissionTreeAttributes: GET_ATTRIBUTES_attributes_permissionsConf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTES_attributes_versionsConf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_ATTRIBUTES_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    linked_tree: string | null;
    multipleValues: boolean;
    permissionsConf: GET_ATTRIBUTES_attributes_permissionsConf | null;
    versionsConf: GET_ATTRIBUTES_attributes_versionsConf | null;
}

export interface GET_ATTRIBUTES {
    attributes: GET_ATTRIBUTES_attributes[] | null;
}

export interface GET_ATTRIBUTESVariables {
    lang?: AvailableLanguage[] | null;
    id?: string | null;
    label?: string | null;
    type?: (AttributeType | null)[] | null;
    format?: (AttributeFormat | null)[] | null;
    system?: boolean | null;
    multipleValues?: boolean | null;
    versionable?: boolean | null;
}
