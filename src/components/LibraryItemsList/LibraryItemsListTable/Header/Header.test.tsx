import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../../_types/types';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import Header from './Header';

describe('Header', () => {
    test('should display value', async () => {
        let comp: any;

        const value = 'value';

        await act(async () => {
            comp = mount(
                <Header
                    stateItems={LibraryItemListInitialState}
                    dispatchItems={jest.fn()}
                    name={'name'}
                    type={AttributeType.simple}
                    setOpenChangeColumns={jest.fn()}
                >
                    {value}
                </Header>
            );
        });

        expect(comp.text()).toContain(value);
    });
});
