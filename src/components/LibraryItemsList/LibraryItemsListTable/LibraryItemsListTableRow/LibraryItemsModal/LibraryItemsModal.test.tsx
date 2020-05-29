import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Modal} from 'semantic-ui-react';
import {IItem} from '../../../../../_types/types';
import MockedLangContextProvider from '../../../../../__mocks__/MockedLangContextProvider';
import LibraryItemsModal from './LibraryItemsModal';

jest.mock('@apollo/react-hooks', () => ({
    useMutation: jest.fn(() => [])
}));

describe('LibraryItemsModal', () => {
    test('Snapshot test', async () => {
        const items: IItem = {
            id: 'test',
            label: 'label-test'
        };

        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedLangContextProvider>
                    <LibraryItemsModal
                        showModal={false}
                        setShowModal={jest.fn()}
                        values={items}
                        setValues={jest.fn()}
                    />
                </MockedLangContextProvider>
            );
        });

        expect(comp.find(Modal)).toHaveLength(1);
    });
});
