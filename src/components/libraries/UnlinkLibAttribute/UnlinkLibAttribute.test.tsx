import {shallow} from 'enzyme';
import * as React from 'react';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import {Mockify} from 'src/_types/Mockify';
import UnlinkLibAttribute from './UnlinkLibAttribute';

describe('UnlinkLibAttribute', () => {
    test('Pass down unlink function', async () => {
        const library: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: false,
            attributes: [
                {
                    id: 'test_attr',
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    system: false,
                    label: {fr: 'Test', en: 'Test'}
                }
            ]
        };
        const onUnlink = jest.fn();

        const comp = shallow(
            <UnlinkLibAttribute
                library={library as GET_LIBRARIES_libraries}
                attribute={library.attributes![0]}
                onUnlink={onUnlink}
            />
        );

        expect(comp.find('ConfirmedButton').props().action).toBeDefined();
    });
});
