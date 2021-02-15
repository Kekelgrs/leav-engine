// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockAttributeStandard} from '__mocks__/common/attribute';
import {ConditionFilter, FilterTypes, IFilter} from '../../../../../../_types/types';
import BooleanFilter from './BooleanFilter';

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }))
    });
});

describe('BooleanFilter', () => {
    const mockFilter: IFilter = {
        id: 'test',
        type: FilterTypes.filter,
        key: 0,
        condition: ConditionFilter.contains,
        value: true,
        attribute: mockAttributeStandard,
        active: true
    };

    test('Should show switch, checked', async () => {
        const comp = shallow(<BooleanFilter filter={{...mockFilter}} updateFilterValue={jest.fn()} />);

        expect(comp.find('Switch').prop('checked')).toBe(true);
    });

    test('Should show switch, unchecked', async () => {
        const comp = shallow(<BooleanFilter filter={{...mockFilter, value: false}} updateFilterValue={jest.fn()} />);

        expect(comp.find('Switch').prop('checked')).toBe(false);
    });
});
