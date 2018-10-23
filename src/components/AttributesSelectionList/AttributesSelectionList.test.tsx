import * as React from 'react';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import AttributesSelectionList from './AttributesSelectionList';

describe('AttributesSelectionList', () => {
    test('Snapshot test', async () => {
        const attributes: GET_ATTRIBUTES_attributes[] = [
            {
                id: 'test_attr',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {
                    fr: 'Test',
                    en: 'Test'
                }
            }
        ];

        const toggleSelection = jest.fn();

        const comp = create(
            <AttributesSelectionList attributes={attributes} selection={[]} toggleSelection={toggleSelection} />
        );

        expect(comp).toMatchSnapshot();
    });
});
