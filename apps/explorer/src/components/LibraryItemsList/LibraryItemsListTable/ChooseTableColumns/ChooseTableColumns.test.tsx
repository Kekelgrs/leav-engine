// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {attributesInitialState} from 'redux/attributes';
import wait from 'waait';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {AttributeFormat, AttributeType, IAttribute} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import ChooseTableColumns from './ChooseTableColumns';

jest.mock(
    '../../../AttributesSelectionList',
    () =>
        function AttributesSelectionList() {
            return <div>AttributesSelectionList</div>;
        }
);

describe('ChooseTableColumns', () => {
    test('should render attributes', async () => {
        const attributesMock: IAttribute[] = [
            {
                id: 'test',
                library: 'test_library',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {
                    fr: 'test',
                    en: 'test'
                },
                isLink: false,
                isMultiple: false
            }
        ];

        const stateMock = {
            attributes: {...attributesInitialState, attributes: attributesMock}
        };

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore state={stateMock}>
                        <ChooseTableColumns openChangeColumns setOpenChangeColumns={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find('AttributesSelectionList')).toHaveLength(1);
    });
});
