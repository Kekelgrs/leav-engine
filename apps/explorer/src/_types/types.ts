// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {
    ILibraryDetailExtendedAttributeParentLinkedLibrary,
    ILibraryDetailExtendedAttributeParentLinkedTree
} from '../queries/libraries/getLibraryDetailExtendQuery';
import {IGetViewListSort} from '../queries/views/getViewsListQuery';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../_gqlTypes/GET_ATTRIBUTES_BY_LIB';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface ILabel {
    [x: string]: string;
}

export interface ILibrary {
    id: string;
    label: ILabel;
    gqlNames: {
        query: string;
        filter: string;
        searchableFields: string;
    };
}

export enum LinkedType {
    library = 'library',
    tree = 'tree'
}

export type IPreview = {
    small: string;
    medium: string;
    big: string;
    pages: string;
} | null;

export interface IItemWhoAmI {
    id: string;
    label?: string;
    preview?: IPreview;
    color?: string;
    library?: {
        id: string;
        label: ILabel;
    };
}

export interface IItemBase {
    fields: {[x: string]: any};
    whoAmI: IItemWhoAmI;
    index: number;
}

export type IItem = IItemBase;

export interface IRecordIdentityWhoAmI {
    [x: string]: any;
    id: string;
    label?: string;
    preview?: IPreview;
    color?: string;
    library?: {
        id: string;
        label: ILabel;
    };
    index?: number;
}

export enum PreviewAttributes {
    small = 'small',
    medium = 'medium',
    big = 'big',
    pages = 'pages'
}

export enum PreviewSize {
    small = 'small',
    medium = 'medium',
    big = 'big'
}

export enum AvailableLanguage {
    en = 'en',
    fr = 'fr'
}

export enum FilterTypes {
    filter = 'filter',
    separator = 'separator'
}

export interface IFilterSeparatorCommon {
    key: number;
    id: string;
}

export interface IFilter extends IFilterSeparatorCommon {
    type: FilterTypes.filter;
    operator?: boolean;
    condition: ConditionFilter;
    value: string | boolean | number;
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list;
    active: boolean;
    format?: AttributeFormat;
    originAttributeData?: IParentAttributeData;
    extendedData?: IEmbeddedFieldData;
    treeData?: ITreeData;
    valueSize?: number | 'auto';
}

export interface IFilterSeparator extends IFilterSeparatorCommon {
    type: FilterTypes.separator;
    active: boolean;
}

export enum AttributeFormat {
    text = 'text',
    numeric = 'numeric',
    date = 'date',
    encrypted = 'encrypted',
    boolean = 'boolean',
    extended = 'extended'
}

export enum AttributeType {
    simple = 'simple',
    simple_link = 'simple_link',
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    tree = 'tree'
}

export enum OperatorFilter {
    and = 'AND',
    or = 'OR',
    openParent = 'OPEN_BRACKET',
    closeParent = 'CLOSE_BRACKET'
}

export enum ConditionFilter {
    contains = 'CONTAINS',
    notContains = 'NOT_CONTAINS',
    equal = 'EQUAL',
    notEqual = 'NOT_EQUAL',
    beginWith = 'BEGIN_WITH',
    endWith = 'END_WITH',
    greaterThan = 'GREATER_THAN',
    lessThan = 'LESS_THAN'
}

export interface IQueryFilter {
    field?: string;
    value?: any;
    condition?: ConditionFilter;
    operator?: OperatorFilter;
}

export enum OrderSearch {
    desc = 'desc',
    asc = 'asc'
}

export enum DisplaySize {
    small = 'listSmall',
    medium = 'listMedium',
    big = 'listBig'
}

export interface IAttribute {
    id: string;
    library: string;
    type: AttributeType;
    format?: AttributeFormat;
    label: SystemTranslation | null;
    isLink: boolean;
    isMultiple: boolean;
    linkedLibrary?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linkedTree?: ILibraryDetailExtendedAttributeParentLinkedTree;
    parentAttributeData?: IParentAttributeData;
}

export type ExtendFormat = string | {[key: string]: ExtendFormat[]};

export interface IEmbeddedFieldData {
    path: string;
    format: AttributeFormat;
}

export interface IFieldBase {
    id: string;
    library: string;
    label: string;
    key: string;
    format?: AttributeFormat;
    embeddedData?: IEmbeddedFieldData;
    multipleValues?: boolean;
}

export interface IFieldTypeBasic extends IFieldBase {
    type: AttributeType.simple | AttributeType.advanced;
    parentAttributeData?: IParentAttributeData;
}

export interface IFieldTypeLink extends IFieldBase {
    type: AttributeType.simple_link | AttributeType.advanced_link;
    parentAttributeData?: IParentAttributeData;
}

export interface IFieldTypeTree extends IFieldBase {
    type: AttributeType.tree;
    parentAttributeData?: IParentAttributeData;
    treeData?: ITreeData;
}

export type IField = IFieldTypeBasic | IFieldTypeLink | IFieldTypeTree;

export interface IRecordEdition {
    show: boolean;
    item?: IItem;
}

export interface IAccordionActive {
    id: string;
    library: string;
    depth: number;
}

export interface ISelectedAttribute {
    id: string;
    library: string;
    path: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format?: AttributeFormat | null;
    multiple_values: boolean;
    parentAttributeData?: IParentAttributeData;
    embeddedFieldData?: IEmbeddedFields;
    treeData?: ITreeData;
}

export interface IParentAttributeData {
    id: string;
    type: AttributeType;
}

export interface ITreeData {
    treeAttributeId: string;
    libraryTypeName: string;
}

export interface IEmbeddedFields {
    id: string;
    format: AttributeFormat;
    label: ILabel;
    embedded_fields: IEmbeddedFields[];
}

export interface IGroupEmbeddedFields {
    [attributeId: string]: {
        embedded_fields: {[key: string]: IEmbeddedFields};
    };
}

export interface IAttributeSelected {
    id: string;
    library: string;
    originAttributeData?: IParentAttributeData;
    extendedData?: IEmbeddedFieldData;
    treeData?: ITreeData;
}

export interface ITree {
    id: string;
    label: ILabel;
    libraries: Array<{
        id: string;
        label: ILabel;
    }>;
}

export interface INavigationPath {
    id: string;
    library: string;
    label?: string | null;
}

export enum NotificationType {
    basic = 'basic',
    success = 'success',
    warning = 'warning',
    error = 'error'
}

export enum NotificationPriority {
    low = 'low',
    medium = 'medium',
    high = 'high'
}

export enum NotificationChannel {
    trigger = 'trigger',
    passive = 'passive'
}

export interface IBaseNotification {
    content: string;
    type: NotificationType;
}

export interface INotification extends IBaseNotification {
    time?: number;
    priority?: NotificationPriority;
    channel?: NotificationChannel;
}

export type ILang = string[];

export enum TypeSideItem {
    filters = 'filters',
    view = 'view'
}

export interface IView {
    id: string;
    label: string;
    type: ViewType;
    color?: string;
    shared: boolean;
    description?: string;
    fields?: string[];
    filters?: IQueryFilter[];
    sort: IGetViewListSort;
}

export enum ViewType {
    list = 'list',
    cards = 'cards',
    timeline = 'timeline'
}

export interface ILinkedElement {
    id: string;
    linkedType: LinkedType;
}
