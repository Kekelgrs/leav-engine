import {shallow} from 'enzyme';
import * as React from 'react';
import {PermissionsActions} from 'src/_gqlTypes/globalTypes';
import EditPermissionsView from './EditPermissionsView';

describe('EditPermissionsView', () => {
    test('Snapshot test', async () => {
        const onChange = jest.fn();

        const comp = shallow(
            <EditPermissionsView
                onChange={onChange}
                permissions={[
                    {name: PermissionsActions.create, allowed: true},
                    {name: PermissionsActions.edit, allowed: true}
                ]}
                heritedPermissions={[
                    {name: PermissionsActions.create, allowed: false},
                    {name: PermissionsActions.edit, allowed: false}
                ]}
            />
        );

        const forbidColor = comp.find('Icon[name="ban"]').prop('style')!.color;
        const allowColor = comp.find('Icon[name="checkmark"]').prop('style')!.color;

        expect(comp.find('PermissionSelector')).toHaveLength(2);
        expect(
            comp
                .find('PermissionSelector')
                .first()
                .prop('forbiddenColor')
        ).toBe(forbidColor);
        expect(
            comp
                .find('PermissionSelector')
                .first()
                .prop('allowedColor')
        ).toBe(allowColor);
    });
});
