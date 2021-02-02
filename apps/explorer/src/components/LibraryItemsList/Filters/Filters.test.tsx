// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Filters from './Filters';

jest.mock(
    './FilterSeparator',
    () =>
        function FilterSeparator() {
            return <div>FilterSeparator</div>;
        }
);

jest.mock(
    './FilterItem',
    () =>
        function FilterItem() {
            return <div>FilterItem</div>;
        }
);

jest.mock(
    './AddFilter',
    () =>
        function AddFilter() {
            return <div>AddFilter</div>;
        }
);

jest.mock('../SearchItems', () => {
    return function SearchItems() {
        return <div>SearchItems</div>;
    };
});

describe('Filters', () => {
    test('check child', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Filters />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AddFilter')).toHaveLength(1);
    });
});
