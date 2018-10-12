import {History} from 'history';
import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {Mockify} from '../../_types/Mockify';
import gqlClient from '../../__mocks__/gqlClient';
import Attributes from './Attributes';

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};
        const comp = create(
            <ApolloProvider client={gqlClient}>
                <Router>
                    <Attributes history={mockHistory as History} />
                </Router>
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
