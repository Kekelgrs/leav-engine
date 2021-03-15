// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IForm, IFormDependentElements, IFormElement} from '_types/forms';
import {IPaginationParams, ISortParams} from '_types/list';
import {IKeyValue} from '_types/shared';

export type IFormForGraphql = Omit<IForm, 'elements'> & {elements: IFormDependentElementsForGraphQL[]};
export type IFormDependentElementsForGraphQL = Omit<IFormDependentElements, 'elements'> & {
    elements: IFormElementForGraphQL[];
};
export type IFormElementForGraphQL = Omit<IFormElement, 'settings'> & {settings: IKeyValue<any>};

export interface IGetFormArgs {
    filters: ICoreEntityFilterOptions & {library: string; system?: boolean};
    pagination: IPaginationParams;
    sort: ISortParams;
}

export interface ISaveFormArgs {
    form: IFormForGraphql;
}

export interface IDeleteFormArgs {
    library: string;
    id: string;
}
