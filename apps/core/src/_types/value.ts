// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecord} from './record';
import {ITreeElement, TreePaths} from './tree';

export interface IValueVersion {
    [treeName: string]: ITreeElement;
}

export interface IDbValueVersion {
    [treeName: string]: string;
}

export interface IValueMetadata {
    [fieldName: string]: any;
}

export interface IGenericValue {
    id_value?: string;
    attribute?: string;
    created_at?: number;
    modified_at?: number;
    created_by?: string;
    modified_by?: string;
    version?: IValueVersion;
    metadata?: IValueMetadata;
}

export interface IStandardValue extends IGenericValue {
    value?: any;
    raw_value?: string;
}

export interface ILinkValue extends IGenericValue {
    value?: IRecord;
}

export interface ITreeValue extends IGenericValue {
    value?: {
        record: IRecord;
    };
}

export type IValue = IStandardValue | ILinkValue | ITreeValue;

export interface IValuesOptions {
    version?: IValueVersion;
    forceArray?: boolean;
    forceGetAllValues?: boolean;
    [optionName: string]: any;
}

export interface IFindValueTree {
    name: string;
    branchIndex: number;
    elementIndex: number;
    elements: TreePaths;
}

export interface IValueEdge {
    _key: string;
    _from: string;
    _to: string;
    attribute: string;
    modified_at: number;
    modified_by: string;
    created_at: number;
    created_by: string;
    version?: IDbValueVersion;
    metadata?: IValueMetadata;
}
