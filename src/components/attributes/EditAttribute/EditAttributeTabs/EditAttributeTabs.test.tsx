import {shallow} from 'enzyme';
import React from 'react';
import {mockAttrAdv, mockAttrSimple} from '../../../../__mocks__/attributes';
import EditAttributeTabs from './EditAttributeTabs';

jest.mock('../../../../utils/utils', () => ({
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

jest.mock('../../../../hooks/useLang');

describe('EditAttributeTabs', () => {
    const mockAttribute = {...mockAttrSimple};

    describe('Header', () => {
        test('Display header with attribute label', async () => {
            const comp = shallow(<EditAttributeTabs attribute={mockAttribute} />);

            expect(
                comp
                    .find('Header')
                    .shallow()
                    .text()
            ).toBe('Mon Attribut');
        });

        test('Display header for new attribute', async () => {
            const comp = shallow(<EditAttributeTabs />);

            expect(
                comp
                    .find('Header')
                    .shallow()
                    .text()
            ).toBe('attributes.new');
        });
    });

    describe('Tabs', () => {
        test('If attribute is not new, display all tabs', async () => {
            const comp = shallow(<EditAttributeTabs attribute={mockAttribute} />);

            const panes: any[] = comp.find('Tab').prop('panes');
            expect(panes.map(p => p.key)).toEqual(['infos', 'permissions', 'actions_list']);
        });

        test('If attribute is new, display only infos tab', async () => {
            const comp = shallow(<EditAttributeTabs />);

            const panes: any[] = comp.find('Tab').prop('panes');
            expect(panes.map(p => p.key)).toEqual(['infos']);
        });

        test('Show metadata tab for advanced attribute', async () => {
            const comp = shallow(<EditAttributeTabs attribute={{...mockAttrAdv}} />);

            const panes: any[] = comp.find('Tab').prop('panes');
            expect(panes.filter(p => p.key === 'metadata')).toHaveLength(1);
        });
    });
});
