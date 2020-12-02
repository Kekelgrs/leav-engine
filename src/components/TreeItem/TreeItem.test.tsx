// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {ITree} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TreeItem from './TreeItem';

describe('TreeItem', () => {
    const mockTree: ITree = {
        id: 'idTree',
        label: {fr: 'labelTree', en: 'labelTree'},
        libraries: [
            {
                id: 'idLib',
                label: {fr: 'labelLib', en: 'labelTree'}
            }
        ]
    };
    test('should display id', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <TreeItem tree={mockTree} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockTree.id);
    });
});
