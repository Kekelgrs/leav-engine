export enum ErrorTypes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export enum Errors {
    CANNOT_SAVE_METADATA = 'CANNOT_SAVE_METADATA',
    ELEMENT_ALREADY_PRESENT = 'ELEMENT_ALREADY_PRESENT',
    ELEMENT_NOT_IN_TREE = 'ELEMENT_NOT_IN_TREE',
    ERROR = 'ERROR',
    FORMAT_ERROR = 'FORMAT_ERROR',
    INVALID_ACTION_TYPE = 'INVALID_ACTION_TYPE',
    INVALID_ATTRIBUTES = 'INVALID_ATTRIBUTES',
    INVALID_ID_FORMAT = 'INVALID_ID_FORMAT',
    INVALID_VERSION = 'INVALID_VERSION',
    METADATA_PERMISSION_ERROR = 'METADATA_PERMISSION_ERROR',
    MISSING_FIELDS = 'MISSING_FIELDS',
    MISSING_LIBRARY_ID = 'MISSING_LIBRARY_ID',
    MISSING_RECORD_ID = 'MISSING_RECORD_ID',
    MISSING_REQUIRED_ACTION = 'MISSING_REQUIRED_ACTION',
    MISSING_TARGET = 'MISSING_TARGET',
    MULTIPLE_VALUES_NOT_ALLOWED = 'MULTIPLE_VALUES_NOT_ALLOWED',
    NON_FILES_LIBRARY = 'NON_FILES_LIBRARY',
    PAGINATION_OFFSET_AND_CURSOR = 'PAGINATION_OFFSET_AND_CURSOR',
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
    UNKNOWN_ATTRIBUTE = 'UNKNOWN_ATTRIBUTE',
    UNKNOWN_ATTRIBUTES = 'UNKNOWN_ATTRIBUTES',
    UNKNOWN_ELEMENT = 'UNKNOWN_ELEMENT',
    UNKNOWN_FORM = 'UNKNOWN_FORM',
    UNKNOWN_FORM_ATTRIBUTES = 'UNKNOWN_FORM_ATTRIBUTES',
    UNKNOWN_LIBRARIES = 'UNKNOWN_LIBRARIES',
    UNKNOWN_LIBRARY = 'UNKNOWN_LIBRARY',
    UNKNOWN_LINKED_RECORD = 'UNKNOWN_LINKED_RECORD',
    UNKNOWN_METADATA_FIELDS = 'UNKNOWN_METADATA_FIELDS',
    UNKNOWN_PARENT = 'UNKNOWN_PARENT',
    UNKNOWN_RECORD = 'UNKNOWN_RECORD',
    UNKNOWN_TREE = 'UNKNOWN_TREE',
    UNKNOWN_TREES = 'UNKNOWN_TREES',
    UNKNOWN_VALUE = 'UNKNOWN_VALUE',
    UNKNOWN_VERSION_TREE = 'UNKNOWN_VERSION_TREE'
}

export interface IExtendedErrorMsg {
    msg: Errors;
    vars: {[varName: string]: any};
}

/**
 * Field error details
 * must be "fieldName: 'message about what failed'"
 */
export type ErrorFieldDetail<T> = {
    [P in keyof T]?: Errors | IExtendedErrorMsg;
};
