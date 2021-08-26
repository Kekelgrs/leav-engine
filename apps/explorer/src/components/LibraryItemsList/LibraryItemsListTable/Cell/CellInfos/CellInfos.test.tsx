// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {PreviewSize} from '../../../../../_types/types';
import CellInfos from './CellInfos';

jest.mock(
    'components/shared/RecordCard',
    () =>
        function RecordCard() {
            return <div>RecordCard</div>;
        }
);

describe('CellInfos', () => {
    test('should contain floating menu', async () => {
        await act(async () => {
            render(<CellInfos record={{} as any} previewSize={PreviewSize.small} />);
        });

        expect(screen.getByTestId('floating-menu')).toBeInTheDocument();
    });
    test('should call RecordCard', async () => {
        await act(async () => {
            render(<CellInfos record={{} as any} previewSize={PreviewSize.small} />);
        });

        expect(screen.getByText('RecordCard')).toBeInTheDocument();
    });
});
