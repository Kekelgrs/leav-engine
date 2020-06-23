import {render} from 'enzyme';
import React from 'react';
import {displayListItemTypes} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import Filters from './Filters';

describe('Filters', () => {
    const stateItems: LibraryItemListState = {
        libQuery: 'test',
        libFilter: 'test',
        libSearchableField: 'test',
        itemsSortField: 'test',
        itemsSortOrder: 'test',
        items: [],
        itemsTotalCount: 0,
        offset: 0,
        pagination: 20,
        displayType: displayListItemTypes.listMedium,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: []
    };

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <Filters stateItems={stateItems} dispatchItems={dispatchItems} libId="test" libQueryName="test" />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
