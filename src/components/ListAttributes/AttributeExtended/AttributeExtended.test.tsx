import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttribute} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import AttributeExtended from './AttributeExtended';

describe('AttributeExtended', () => {
    const mockAttribute: IAttribute = {
        id: 'test',
        library: 'test_library',
        type: AttributeType.simple,
        label: {
            fr: 'test',
            en: 'test'
        },
        isLink: false,
        isMultiple: false
    };

    test('Should call ExploreEmbeddedFields', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AttributeExtended
                        stateListAttribute={ListAttributeInitialState}
                        dispatchListAttribute={jest.fn()}
                        attribute={mockAttribute}
                        handleCheckboxChange={jest.fn()}
                        handleRadioChange={jest.fn()}
                        previousDepth={0}
                        itemClick={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('EmbeddedFieldItem')).toHaveLength(1);
    });
});
