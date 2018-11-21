import {render} from 'enzyme';
import {History} from 'history';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {Mockify} from 'src/_types/Mockify';
import Trees from './Trees';

describe('Trees', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const comp = render(
            <MockedProvider>
                <Router>
                    <Trees history={mockHistory as History} />
                </Router>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
