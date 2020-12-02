// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DELETE_VALUE
// ====================================================

export interface DELETE_VALUE_deleteValue {
    attribute: string | null;
    id_value: string | null;
    value: Any | null;
}

export interface DELETE_VALUE {
    deleteValue: DELETE_VALUE_deleteValue;
}

export interface DELETE_VALUEVariables {
    library: string;
    recordId: string;
    attribute: string;
    valueId?: string | null;
}
