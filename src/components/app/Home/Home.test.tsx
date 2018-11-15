import {shallow} from 'enzyme';
import * as React from 'react';
import Home from './Home';

describe('Home', () => {
    test('Snapshot test', async () => {
        const comp = shallow(<Home />).html();

        expect(comp).toMatchSnapshot();
    });
});
