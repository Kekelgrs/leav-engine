// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AttributeFormat {
    boolean = 'boolean',
    date = 'date',
    encrypted = 'encrypted',
    extended = 'extended',
    numeric = 'numeric',
    text = 'text'
}

export enum AttributeType {
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    simple = 'simple',
    simple_link = 'simple_link',
    tree = 'tree'
}

export enum NotificationChannel {
    passive = 'passive',
    trigger = 'trigger'
}

export enum NotificationPriority {
    high = 'high',
    low = 'low',
    medium = 'medium'
}

export enum NotificationType {
    basic = 'basic',
    error = 'error',
    success = 'success',
    warning = 'warning'
}

export enum RecordFilterCondition {
    BEGIN_WITH = 'BEGIN_WITH',
    CONTAINS = 'CONTAINS',
    END_WITH = 'END_WITH',
    EQUAL = 'EQUAL',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    NOT_CONTAINS = 'NOT_CONTAINS',
    NOT_EQUAL = 'NOT_EQUAL'
}

export enum RecordFilterOperator {
    AND = 'AND',
    CLOSE_BRACKET = 'CLOSE_BRACKET',
    OPEN_BRACKET = 'OPEN_BRACKET',
    OR = 'OR'
}

export enum SortOrder {
    asc = 'asc',
    desc = 'desc'
}

export enum ViewTypes {
    cards = 'cards',
    list = 'list',
    timeline = 'timeline'
}

export interface RecordFilterInput {
    field?: string | null;
    value?: string | null;
    condition?: RecordFilterCondition | null;
    operator?: RecordFilterOperator | null;
}

export interface RecordSortInput {
    field?: string | null;
    order: SortOrder;
}

export interface TreeElementInput {
    id: string;
    library: string;
}

export interface ValueBatchInput {
    attribute?: string | null;
    id_value?: string | null;
    value?: string | null;
    metadata?: any | null;
}

export interface ValueVersionInput {
    name: string;
    value: TreeElementInput;
}

export interface ViewInput {
    id?: string | null;
    library: string;
    type: ViewTypes;
    shared: boolean;
    label?: any | null;
    description?: any | null;
    color?: string | null;
    filters?: RecordFilterInput[] | null;
    sort?: RecordSortInput | null;
    settings?: ViewSettingsInput[] | null;
}

export interface ViewSettingsInput {
    name: string;
    value?: any | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
