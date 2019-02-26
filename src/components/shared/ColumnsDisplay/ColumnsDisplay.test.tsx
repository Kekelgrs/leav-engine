import {shallow} from 'enzyme';
import React from 'react';
import ColumnsDisplay from './ColumnsDisplay';

describe('ColumnsDisplay', () => {
    test('Snapshot test', async () => {
        const cols = [<div className="col-content" key="1" />, <div className="col-content" key="2" />];

        const comp = shallow(<ColumnsDisplay columnsNumber={4} columnsContent={cols} />);

        expect(comp).toMatchSnapshot();
    });
    test('Display columns', async () => {
        const cols = [<div className="col-content" key="1" />, <div className="col-content" key="2" />];

        const comp = shallow(<ColumnsDisplay columnsNumber={4} columnsContent={cols} />);

        expect(comp.find('div.col-content')).toHaveLength(2);
    });
});
