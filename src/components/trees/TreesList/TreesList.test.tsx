import {render} from 'enzyme';
import React from 'react';
import TreesList from './TreesList';

jest.mock('../../../hooks/useLang');

describe('TreesList', () => {
    test('Snapshot test', async () => {
        const onRowClick = jest.fn();
        const comp = render(<TreesList trees={null} onRowClick={onRowClick} />);

        expect(comp).toMatchSnapshot();
    });
});
