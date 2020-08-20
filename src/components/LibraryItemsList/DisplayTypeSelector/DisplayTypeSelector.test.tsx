import {mount} from 'enzyme';
import React from 'react';
import {DisplayListItemTypes} from '../../../_types/types';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import TileDisplay from '../TileDisplay';
import DisplayTypeSelector from './DisplayTypeSelector';

jest.mock(
    '../TileDisplay',
    () =>
        function ItemsTitleDisplay() {
            return <div>ItemsTitleDisplay</div>;
        }
);

jest.mock(
    '../LibraryItemsListTable',
    () =>
        function LibraryItemsListTable() {
            return <div>LibraryItemsListTable</div>;
        }
);

describe('DisplayTypeSelector', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('Should call ItemsTitleDisplay', async () => {
        const mockState = {...stateItems, displayType: DisplayListItemTypes.tile};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(TileDisplay)).toHaveLength(1);
    });

    // disabled for now
    // test('Should call LibraryItemsListTable', async () => {
    //     const mockState = {...stateItems, displayType: DisplayListItemTypes.listSmall};
    //     const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

    //     expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    // });

    // test('Should call LibraryItemsListTable', async () => {
    //     const mockState = {...stateItems, displayType: DisplayListItemTypes.listMedium};
    //     const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

    //     expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    // });

    // test('Should call LibraryItemsListTable', async () => {
    //     const mockState = {...stateItems, displayType: DisplayListItemTypes.listBig};
    //     const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

    //     expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    // });
});
