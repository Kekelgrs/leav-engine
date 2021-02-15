// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {ConditionFilter, ILabel, OperatorFilter, OrderSearch, ViewType} from '../../_types/types';
import {IGetViewListElement} from './getViewsListQuery';

export type IAddViewMutation = IGetViewListElement;

export interface IAddViewMutationVariablesFilter {
    field?: string;
    value?: string;
    condition?: ConditionFilter;
    operator?: OperatorFilter;
}

export interface IAddViewMutationVariablesSetting {
    name: string;
    value: any;
}

export interface IAddViewMutationVariablesView {
    id?: string;
    library: string;
    type: ViewType;
    shared: boolean;
    label: ILabel;
    description?: ILabel;
    color: string;
    filters: IAddViewMutationVariablesFilter[];
    sort: {
        field: string;
        order: OrderSearch;
    };
    settings: IAddViewMutationVariablesSetting[];
}

export interface IAddViewMutationVariables {
    view: IAddViewMutationVariablesView;
}

const addViewMutation = gql`
    mutation ADD_VIEW($view: ViewInput!) {
        saveView(view: $view) {
            id
        }
    }
`;

export default addViewMutation;
