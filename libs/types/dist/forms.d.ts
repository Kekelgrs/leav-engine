import {IKeyValue} from './utils';
export declare enum FormUIElementTypes {
    DIVIDER = 'divider',
    FIELDS_CONTAINER = 'fields_container',
    TEXT_BLOCK = 'text_block',
    TABS = 'tabs'
}
export declare enum FormFieldTypes {
    TEXT_INPUT = 'input_field',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    ENCRYPTED = 'encrypted',
    DROPDOWN = 'dropdown'
}
export declare enum TabsDirection {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical'
}
export interface IFormDividerSettings {
    title?: string;
}
export interface IFormTabSettings {
    label?: IKeyValue<string>;
    id: string;
}
export interface IFormTabsSettings {
    tabs: IFormTabSettings[];
    direction: TabsDirection;
}
export interface IFormTextBlockSettings {
    content?: string;
}
