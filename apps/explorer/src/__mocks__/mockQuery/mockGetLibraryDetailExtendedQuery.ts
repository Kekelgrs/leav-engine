// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_LIBRARY_DETAIL,
    GET_LIBRARY_DETAILVariables,
    GET_LIBRARY_DETAIL_libraries_list,
    GET_LIBRARY_DETAIL_libraries_list_defaultView
} from '_gqlTypes/GET_LIBRARY_DETAIL';
import {ViewTypes} from '_gqlTypes/globalTypes';
import {AttributeFormat, AttributeType} from '_types/types';
import {mockLabel} from '__mocks__/common/label';

export const mockGetLibraryDetailExtendedDefaultView: GET_LIBRARY_DETAIL_libraries_list_defaultView = {
    id: 'defaultViewId',
    label: mockLabel('defaultViewLabel'),
    type: ViewTypes.list,
    shared: false,
    filters: [],
    color: null,
    sort: null,
    settings: null
};

export const mockGetLibraryDetailExtendedElement: GET_LIBRARY_DETAIL_libraries_list = {
    id: 'test',
    system: true,
    label: {
        fr: 'label',
        en: 'label'
    },
    attributes: [
        {
            id: 'test',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            label: {
                fr: 'Actif',
                en: 'Active'
            },
            multiple_values: false
        }
    ],
    gqlNames: {
        query: 'files',
        filter: 'FileFilter',
        searchableFields: 'FileSearchableFields',
        type: 'type'
    },
    defaultView: mockGetLibraryDetailExtendedDefaultView
};

export const mockGetLibraryDetailExtendedQuery: GET_LIBRARY_DETAIL = {
    libraries: {
        list: [mockGetLibraryDetailExtendedElement]
    }
};
export const mockGetLibraryDetailExtendedQueryVar: GET_LIBRARY_DETAILVariables = {
    libId: 'test'
};
