import {render} from 'enzyme';
import {History} from 'history';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {Mockify} from 'src/_types/Mockify';
import EditTree from './EditTree';

describe('EditTree', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};

        const comp = render(
            <MockedProvider>
                <EditTree match={mockMatch} history={mockHistory as History} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
