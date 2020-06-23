import {displayListItemTypes, IItem, IQueryFilter, orderSearch} from '../../_types/types';

export enum LibraryItemListReducerActionTypes {
    SET_LIB_INFOS = 'SET_LIB_INFOS',
    SET_SEARCH_INFOS = 'SET_SEARCH_INFOS',
    SET_ITEMS = 'SET_ITEMS',
    SET_ITEMS_AND_TOTAL_COUNT = 'SET_ITEMS_AND_TOTAL_COUNT',
    SET_OFFSET = 'SET_OFFSET',
    SET_PAGINATION = 'SET_PAGINATION',
    SET_DISPLAY_TYPE = 'SET_DISPLAY_TYPE',
    SET_SHOW_FILTER = 'SET_SHOW_FILTER',
    SET_SELECTION_MODE = 'SET_SELECTION_MODE',
    SET_ITEMS_SELECTED = 'SET_ITEMS_SELECTED',
    SET_QUERY_FILTERS = 'SET_QUERY_FILTERS'
}

export interface LibraryItemListState {
    libQuery: string;
    libFilter: string;
    libSearchableField: string;
    itemsSortField: string;
    itemsSortOrder: string;
    items?: IItem[];
    itemsTotalCount: number;
    offset: number;
    pagination: number;
    displayType: displayListItemTypes;
    showFilters: boolean;
    selectionMode: boolean;
    itemsSelected: {[x: string]: boolean};
    queryFilters: IQueryFilter[];
}

export const initialState: LibraryItemListState = {
    libQuery: '',
    libFilter: '',
    libSearchableField: '',
    itemsSortField: '',
    itemsSortOrder: '',
    itemsTotalCount: 0,
    offset: 0,
    pagination: 20,
    displayType: displayListItemTypes.listSmall,
    showFilters: false,
    selectionMode: false,
    itemsSelected: {},
    queryFilters: []
};

export type LibraryItemListReducerAction =
    | {
          type: LibraryItemListReducerActionTypes.SET_LIB_INFOS;
          libQuery: string;
          libFilter: string;
          libSearchableField: string;
          itemsSortField: string;
          itemsSortOrder: orderSearch;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SEARCH_INFOS;
          itemsSortField: string;
          itemsSortOrder: orderSearch;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEMS;
          items: IItem[];
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT;
          items: IItem[];
          totalCount: number;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_OFFSET;
          offset: number;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_PAGINATION;
          pagination: number;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE;
          displayType: displayListItemTypes;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SHOW_FILTER;
          showFilter: boolean;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE;
          selectionMode: boolean;
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED;
          itemsSelected: {[x: string]: boolean};
      }
    | {
          type: LibraryItemListReducerActionTypes.SET_QUERY_FILTERS;
          queryFilters: IQueryFilter[];
      };

const reducer = (state: LibraryItemListState, action: LibraryItemListReducerAction) => {
    switch (action.type) {
        case LibraryItemListReducerActionTypes.SET_LIB_INFOS:
            const {libQuery, libFilter, libSearchableField, itemsSortField, itemsSortOrder} = action;
            return {...state, libQuery, libFilter, libSearchableField, itemsSortField, itemsSortOrder};
        case LibraryItemListReducerActionTypes.SET_SEARCH_INFOS:
            return {...state, itemsSortField: action.itemsSortField, itemsSortOrder: action.itemsSortOrder};
        case LibraryItemListReducerActionTypes.SET_ITEMS:
            return {...state, items: action.items};
        case LibraryItemListReducerActionTypes.SET_ITEMS_AND_TOTAL_COUNT:
            return {...state, items: action.items, itemsTotalCount: action.totalCount};
        case LibraryItemListReducerActionTypes.SET_OFFSET:
            return {...state, offset: action.offset};
        case LibraryItemListReducerActionTypes.SET_PAGINATION:
            return {...state, pagination: action.pagination};
        case LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE:
            return {...state, displayType: action.displayType};
        case LibraryItemListReducerActionTypes.SET_SHOW_FILTER:
            return {...state, showFilter: action.showFilter};
        case LibraryItemListReducerActionTypes.SET_SELECTION_MODE:
            return {...state, selectionMode: action.selectionMode};
        case LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED:
            return {...state, itemsSelected: action.itemsSelected};
        case LibraryItemListReducerActionTypes.SET_QUERY_FILTERS:
            return {...state, queryFilters: action.queryFilters};
        default:
            return state;
    }
};

export default reducer;
