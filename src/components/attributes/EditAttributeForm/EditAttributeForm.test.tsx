import {shallow} from 'enzyme';
import {i18n} from 'i18next';
import * as React from 'react';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import {Mockify} from 'src/_types/Mockify';
import EditAttributeForm from './EditAttributeForm';

jest.mock('src/utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

describe('EditAttributeForm', () => {
    const mockI18n: Mockify<i18n> = {
        language: 'fr',
        options: {
            fallbackLng: ['en']
        }
    };
    const attribute: GET_ATTRIBUTES_attributes = {
        id: 'attr1',
        type: AttributeType.simple,
        format: AttributeFormat.text,
        system: false,
        label: {fr: 'Test 1', en: null}
    };
    const onSubmit = jest.fn();

    test('Render form for existing attribute', async () => {
        const comp = shallow(<EditAttributeForm attribute={attribute} onSubmit={onSubmit} i18n={mockI18n as i18n} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test 1');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new attribute', async () => {
        const comp = shallow(<EditAttributeForm attribute={null} onSubmit={onSubmit} i18n={mockI18n as i18n} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('attributes.new');
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });

    test('Autofill ID with label on new attribute', async () => {
        const comp = shallow(<EditAttributeForm attribute={null} onSubmit={onSubmit} i18n={mockI18n as i18n} />);

        comp.find('FormInput[name="label/fr"]').simulate('change', null, {
            type: 'text',
            name: 'label/fr',
            value: 'labelfr'
        });

        expect(comp.find('FormInput[name="id"]').props().value).toBe('labelfr');
    });

    test('Call submit function on submit', async () => {
        const comp = shallow(<EditAttributeForm attribute={attribute} onSubmit={onSubmit} i18n={mockI18n as i18n} />);
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
