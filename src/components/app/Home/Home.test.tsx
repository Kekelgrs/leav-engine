import {MockedProvider} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import Home from './Home';

describe('Home', () => {
    test('Snapshot test', async () => {
        const comp = shallow(
            <MockedProvider>
                <MockedUserContextProvider>
                    <Home />
                </MockedUserContextProvider>
            </MockedProvider>
        ).html();

        expect(comp).toMatchSnapshot();
    });
});
