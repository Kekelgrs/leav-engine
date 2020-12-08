// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {Mockify} from '../../../../../_types/Mockify';
import {mockTree} from '../../../../../__mocks__/trees';
import InfosTab from './InfosTab';

jest.mock('../../../../../hooks/useLang');

jest.mock('./InfosForm', () => {
    return function TreeInfosForm() {
        return <div>TreeInfosForm</div>;
    };
});

describe('InfosTab', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const comp = render(<InfosTab tree={mockTree} readonly={false} history={mockHistory as History} />);

        expect(comp).toMatchSnapshot();
    });
});
