// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {selectionInitialState} from 'redux/selection';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockSharedSearchSelection} from '__mocks__/common/selection';
import CellSelection from './CellSelection';

describe('CellSelection', () => {
    test('should contain hidden-checkbox', async () => {
        await act(async () => {
            render(
                <MockStore>
                    <CellSelection index="0" selectionData={{id: 'id', library: 'library', label: 'label'}} />
                </MockStore>
            );
        });

        expect(screen.getByTestId('hidden-checkbox')).toBeInTheDocument();
    });

    test('should contain checkbox', async () => {
        await act(async () => {
            render(
                <MockStore state={{selection: {...selectionInitialState, selection: mockSharedSearchSelection}}}>
                    <CellSelection index="0" selectionData={{id: 'id', library: 'library', label: 'label'}} />
                </MockStore>
            );
        });

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
});
