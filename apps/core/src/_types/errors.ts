// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export enum ErrorTypes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export enum Errors {
    ATTRIBUTE_USED_IN_METADATA = 'ATTRIBUTE_USED_IN_METADATA',
    ONLY_FOLDERS_CAN_BE_SELECTED = 'ONLY_FOLDERS_CAN_BE_SELECTED',
    CANNOT_ADD_SYSTEM_ATTRIBUTES = 'CANNOT_ADD_SYSTEM_ATTRIBUTES',
    CANNOT_SAVE_METADATA = 'CANNOT_SAVE_METADATA',
    ELEMENT_ALREADY_PRESENT = 'ELEMENT_ALREADY_PRESENT',
    ELEMENT_ALREADY_PRESENT_IN_ANCESTORS = 'ELEMENT_ALREADY_PRESENT_IN_ANCESTORS',
    ELEMENT_NOT_IN_TREE = 'ELEMENT_NOT_IN_TREE',
    ELEMENT_WITH_SAME_PATH_ALREADY_PRESENT = 'ELEMENT_WITH_SAME_PATH_ALREADY_PRESENT',
    ERROR = 'ERROR',
    FILE_ERROR = 'FILE_ERROR',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    FORBIDDEN_ID = 'FORBIDDEN_ID',
    FORBIDDEN_KEY = 'FORBIDDEN_KEY',
    DUPLICATE_FILENAMES = 'DUPLICATE_FILENAMES',
    DUPLICATE_DIRECTORY_NAMES = 'DUPLICATE_DIRECTORY_NAMES',
    FORMAT_ERROR = 'FORMAT_ERROR',
    INVALID_ACTION_TYPE = 'INVALID_ACTION_TYPE',
    INVALID_ATTRIBUTES = 'INVALID_ATTRIBUTES',
    INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
    INVALID_EMAIL = 'INVALID_EMAIL',
    INVALID_ENDPOINT_FORMAT = 'INVALID_ENDPOINT_FORMAT',
    INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
    INVALID_FILTER_CONDITION_VALUE = 'INVALID_FILTER_CONDITION_VALUE',
    INVALID_FILTER_FIELDS = 'INVALID_FILTERS_FIELDS',
    INVALID_FILTER_FORMAT = 'INVALID_FILTER_FORMAT',
    INVALID_FILTERS_EXPRESSION = 'INVALID_FILTERS_EXPRESSION',
    INVALID_FULLTEXT_ATTRIBUTES = 'INVALID_FULLTEXT_ATTRIBUTES',
    INVALID_ID_FORMAT = 'INVALID_ID_FORMAT',
    INVALID_MAPPING = 'INVALID_MAPPING',
    INVALID_PERMISSIONS_CONF_LIBRARIES = 'INVALID_PERMISSIONS_CONF_LIBRARIES',
    INVALID_SORT_FIELDS = 'INVALID_SORT_FIELDS',
    INVALID_VALUES_VERSIONS_SETTINGS_BAD_NODE_ID = 'INVALID_VALUES_VERSIONS_SETTINGS_BAD_NODE_ID',
    INVALID_VARIABLE_FUNCTION = 'INVALID_VARIABLE_FUNCTION',
    INVALID_VERSION = 'INVALID_VERSION',
    LIBRARY_FORBIDDEN_AS_CHILD = 'LIBRARY FORBIDDEN AS CHILD',
    METADATA_PERMISSION_ERROR = 'METADATA_PERMISSION_ERROR',
    MISSING_ELEMENTS = 'MISSING_ELEMENTS',
    MISSING_FIELDS = 'MISSING_FIELDS',
    MISSING_LIBRARY_ID = 'MISSING_LIBRARY_ID',
    MISSING_RECORD_ID = 'MISSING_RECORD_ID',
    MISSING_REQUIRED_ACTION = 'MISSING_REQUIRED_ACTION',
    MISSING_TARGET = 'MISSING_TARGET',
    MULTIPLE_VALUES_NOT_ALLOWED = 'MULTIPLE_VALUES_NOT_ALLOWED',
    NO_IMPORT_MATCHES = 'NO_IMPORT_MATCHES',
    NON_FILES_LIBRARY = 'NON_FILES_LIBRARY',
    PAGINATION_OFFSET_AND_CURSOR = 'PAGINATION_OFFSET_AND_CURSOR',
    PROTECTED_ENDPOINT = 'PROTECTED_ENDPOINT',
    READONLY_ATTRIBUTE = 'READONLY_ATTRIBUTE',
    REQUIRED_ATTRIBUTE_FORMAT = 'REQUIRED_ATTRIBUTE_FORMAT',
    REQUIRED_ATTRIBUTE_LABEL = 'REQUIRED_ATTRIBUTE_LABEL',
    REQUIRED_ATTRIBUTE_LINKED_LIBRARY = 'REQUIRED_ATTRIBUTE_LINKED_LIBRARY',
    REQUIRED_ATTRIBUTE_LINKED_TREE = 'REQUIRED_ATTRIBUTE_LINKED_TREE',
    REQUIRED_ATTRIBUTE_TYPE = 'REQUIRED_ATTRIBUTE_TYPE',
    SYSTEM_ATTRIBUTE_DELETION = 'SYSTEM_ATTRIBUTE_DELETION',
    SYSTEM_LIBRARY_DELETION = 'SYSTEM_LIBRARY_DELETION',
    SYSTEM_TREE_DELETION = 'SYSTEM_TREE_DELETION',
    TOO_MUCH_LIBRARIES_ON_FILES_TREE = 'TOO_MUCH_LIBRARIES_ON_FILES_TREE',
    UNBINDED_ATTRIBUTES = 'UNBINDED_ATTRIBUTES',
    UNIQUE_VALUE_NOT_ALLOWED = 'UNIQUE_VALUE_NOT_ALLOWED',
    UNKNOWN_API_KEY = 'UNKNOWN_API_KEY',
    UNKNOWN_APPLICATION = 'UNKNOWN_APPLICATION',
    UNKNOWN_ATTRIBUTE = 'UNKNOWN_ATTRIBUTE',
    UNKNOWN_ATTRIBUTES = 'UNKNOWN_ATTRIBUTES',
    UNKNOWN_ELEMENT = 'UNKNOWN_ELEMENT',
    UNKNOWN_FORM = 'UNKNOWN_FORM',
    UNKNOWN_FORM_ATTRIBUTES = 'UNKNOWN_FORM_ATTRIBUTES',
    UNKNOWN_LIBRARIES = 'UNKNOWN_LIBRARIES',
    UNKNOWN_LIBRARY = 'UNKNOWN_LIBRARY',
    UNKNOWN_LINKED_RECORD = 'UNKNOWN_LINKED_RECORD',
    UNKNOWN_METADATA_FIELDS = 'UNKNOWN_METADATA_FIELDS',
    UNKNOWN_NODE = 'UNKNOWN_NODE',
    UNKNOWN_PARENT = 'UNKNOWN_PARENT',
    UNKNOWN_RECORD = 'UNKNOWN_RECORD',
    UNKNOWN_TREE = 'UNKNOWN_TREE',
    UNKNOWN_TREES = 'UNKNOWN_TREES',
    UNKNOWN_VALUE = 'UNKNOWN_VALUE',
    UNKNOWN_VERSION_PROFILE = 'UNKNOWN_VERSION_PROFILE',
    UNKNOWN_VERSION_TREE = 'UNKNOWN_VERSION_TREE',
    UNKNOWN_VIEW = 'UNKNOWN_VIEW',
    USER_IS_NOT_VIEW_OWNER = 'USER_IS_NOT_VIEW_OWNER',
    VALUE_NOT_UNIQUE = 'VALUE_NOT_UNIQUE'
}

export interface IExtendedErrorMsg {
    msg: Errors | string;
    vars: {[varName: string]: any};
}

export type ErrorFieldDetailMessage = Errors | IExtendedErrorMsg | string;

/**
 * Field error details
 * must be "fieldName: 'message about what failed'"
 */
export type ErrorFieldDetail<T> = {
    [P in keyof T]?: ErrorFieldDetailMessage;
};
