// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {act, create} from 'react-test-renderer';
import {GET_LIBRARIES_libraries_list} from '../../../../../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../../../../../_types/Mockify';
import {mockAttrSimple} from '../../../../../../__mocks__/attributes';
import InfosForm from './InfosForm';

jest.mock('../../../../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getFieldError: jest.fn().mockReturnValue(''),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr'])
}));

jest.mock('../../../../../../hooks/useLang');

jest.mock('../../../../../views/ViewSelector', () => {
    return function ViewSelector() {
        return <div>ViewSelector</div>;
    };
});

describe('InfosForm', () => {
    const library: Mockify<GET_LIBRARIES_libraries_list> = {
        id: 'test',
        label: {fr: 'Test', en: null},
        system: false,
        attributes: [{...mockAttrSimple, id: 'test_attr', label: {fr: 'Test', en: 'Test'}}]
    };
    const onSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    test('Render form for existing library', async () => {
        const comp = render(
            <InfosForm
                onSubmit={onSubmit}
                library={library as GET_LIBRARIES_libraries_list}
                readonly={false}
                onCheckIdExists={onCheckIdExists}
            />
        );
        expect(comp.find('input[name="id"]').prop('disabled')).toBe(true);
    });

    test('Render form for new library', async () => {
        const comp = render(
            <InfosForm onSubmit={onSubmit} library={null} readonly={false} onCheckIdExists={onCheckIdExists} />
        );
        expect(comp.find('input[name="id"]').prop('disabled')).toBe(false);
    });

    test('Autofill ID with label on new lib', async () => {
        const comp = create(
            <InfosForm onSubmit={onSubmit} library={null} readonly={false} onCheckIdExists={onCheckIdExists} />
        );

        act(() => {
            comp.root.findByProps({name: 'label.fr'}).props.onChange(null, {
                type: 'text',
                name: 'label.fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });
});
