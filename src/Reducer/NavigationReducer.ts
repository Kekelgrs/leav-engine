import {IRecordField} from '../queries/trees/getTreeContentQuery';
import {INavigationPath} from '../_types/types';

export enum NavigationReducerActionsTypes {
    SET_PATH = 'SET_PATH',
    SET_IS_LOADING = 'SET_IS_LOADING',
    SET_RECORD_DETAIL = 'SET_RECORD_DETAIL'
}

export interface NavigationReducerState {
    path: INavigationPath[];
    isLoading: boolean;
    recordDetail?: IRecordField;
}

export const NavigationReducerInitialState: NavigationReducerState = {
    path: [],
    isLoading: true
};

export type NavigationReducerAction =
    | {
          type: NavigationReducerActionsTypes.SET_PATH;
          path: INavigationPath[];
      }
    | {
          type: NavigationReducerActionsTypes.SET_IS_LOADING;
          isLoading: boolean;
      }
    | {
          type: NavigationReducerActionsTypes.SET_RECORD_DETAIL;
          recordDetail: IRecordField;
      };

export const NavigationReducer = (state: NavigationReducerState, action: NavigationReducerAction) => {
    switch (action.type) {
        case NavigationReducerActionsTypes.SET_PATH:
            return {...state, path: action.path};
        case NavigationReducerActionsTypes.SET_IS_LOADING:
            return {...state, isLoading: action.isLoading};
        case NavigationReducerActionsTypes.SET_RECORD_DETAIL:
            return {...state, recordDetail: action.recordDetail};
        default:
            return state;
    }
};

// Actions

export const setPath = (path: INavigationPath[]): NavigationReducerAction => ({
    type: NavigationReducerActionsTypes.SET_PATH,
    path
});

export const setIsLoading = (isLoading: boolean): NavigationReducerAction => {
    return {
        type: NavigationReducerActionsTypes.SET_IS_LOADING,
        isLoading
    };
};

export const setRecordDetail = (recordDetail: IRecordField): NavigationReducerAction => {
    return {
        type: NavigationReducerActionsTypes.SET_RECORD_DETAIL,
        recordDetail
    };
};
