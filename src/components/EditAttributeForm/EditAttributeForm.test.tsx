import * as React from 'react';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';
import EditAttributeForm from './EditAttributeForm';

describe('EditAttributeForm', () => {
    test('Snapshot test', async () => {
        const attribute: GET_ATTRIBUTES_attributes = {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null}
        };

        const onSubmit = jest.fn();

        const comp = create(<EditAttributeForm attribute={attribute} onSubmit={onSubmit} />);

        expect(comp).toMatchSnapshot();
    });
});
