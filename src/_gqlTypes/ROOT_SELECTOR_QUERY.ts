/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL query operation: ROOT_SELECTOR_QUERY
// ====================================================

export interface ROOT_SELECTOR_QUERY_libraries_list {
    id: string;
    label: any | null;
}

export interface ROOT_SELECTOR_QUERY_libraries {
    list: ROOT_SELECTOR_QUERY_libraries_list[];
}

export interface ROOT_SELECTOR_QUERY {
    libraries: ROOT_SELECTOR_QUERY_libraries | null;
}

export interface ROOT_SELECTOR_QUERYVariables {
    lang?: AvailableLanguage[] | null;
}
