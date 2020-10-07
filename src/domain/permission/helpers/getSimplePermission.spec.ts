import {IQueryInfos} from '_types/queryInfos';
import {PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import * as getPermissionsByActions from './getPermissionsByActions';
import getSimplePermission from './getSimplePermission';

describe('getSimplePermission', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    test('Should return a permission', async () => {
        jest.spyOn(getPermissionsByActions, 'default').mockReturnValue(
            Promise.resolve({
                [RecordPermissionsActions.ACCESS]: true,
                [RecordPermissionsActions.EDIT]: false,
                [RecordPermissionsActions.DELETE]: null
            })
        );

        const permAccess = await getSimplePermission(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                action: RecordPermissionsActions.ACCESS,
                usersGroupId: '12345',
                permissionTreeTarget: {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                },
                ctx
            },
            {}
        );

        const permEdit = await getSimplePermission(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                action: RecordPermissionsActions.EDIT,
                usersGroupId: '12345',
                permissionTreeTarget: {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                },
                ctx
            },
            {}
        );

        const permDelete = await getSimplePermission(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                action: RecordPermissionsActions.DELETE,
                usersGroupId: '12345',
                permissionTreeTarget: {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                },
                ctx
            },
            {}
        );

        expect(permAccess).toBe(true);
        expect(permEdit).toBe(false);
        expect(permDelete).toBe(null);
    });
});
