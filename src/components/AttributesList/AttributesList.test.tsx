import * as React from 'react';
import {ApolloProvider} from 'react-apollo';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';
import gqlClient from '../../__mocks__/gqlClient';
import AttributesList from './AttributesList';

describe('AttributesList', () => {
    test('Snapshot test', async () => {
        const attributes: GET_ATTRIBUTES_attributes[] = [
            {
                id: 'attr1',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test 1', en: null}
            },
            {
                id: 'attr2',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test 2', en: null}
            },
            {
                id: 'attr3',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test 3', en: null}
            }
        ];

        const onRowClick = jest.fn();

        const comp = create(
            <ApolloProvider client={gqlClient}>
                <AttributesList attributes={attributes} onRowClick={onRowClick} />
            </ApolloProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
