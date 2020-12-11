// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import * as getPermissionByUserGroups from './helpers/getPermissionByUserGroups';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import {IPermissionDomain} from './permissionDomain';
import recordPermissionDomain from './recordPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

jest.mock('./helpers/getDefaultPermission', () => jest.fn().mockReturnValue(false));

describe('recordPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordPermissionDomainTest'
    };

    const defaultPerm = false;
    describe('getRecordPermission', () => {
        const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
            getTreePermission: global.__mockPromise(true)
        };

        const mockPermDomain: Mockify<IPermissionDomain> = {};

        const mockLibPermDomain: Mockify<ILibraryPermissionDomain> = {
            getLibraryPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        const mockLibSimplePerms = {
            system: false,
            permissions_conf: {
                relation: 'AND',
                permissionTreeAttributes: ['category']
            }
        };

        const mockAttrProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            }
        };
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(({id}) => Promise.resolve(mockAttrProps[id]))
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation(({attribute}) => {
                let val;
                switch (attribute.id) {
                    case 'category':
                        val = {
                            id_value: 12345,
                            value: {
                                record: {
                                    id: 1,
                                    library: 'category'
                                }
                            }
                        };
                        break;
                    case 'user_groups':
                        val = {
                            id_value: 54321,
                            value: {
                                record: {
                                    id: 1,
                                    library: 'users_groups'
                                }
                            }
                        };
                        break;
                }

                return Promise.resolve([val]);
            })
        };

        test('Return tree permission', async () => {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibSimplePerms]})
            };

            const recordPermDomain = recordPermissionDomain({
                'core.domain.permission': mockPermDomain as IPermissionDomain,
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.permission.library': mockLibPermDomain as ILibraryPermissionDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissionsActions.ACCESS_RECORD,
                '987654',
                'test_lib',
                '123456',
                ctx
            );

            expect(mockTreePermDomain.getTreePermission.mock.calls.length).toBe(1);
            expect(mockValueRepo.getValues.mock.calls.length).toBe(1);
            expect(perm).toBe(true);
        });

        test('Return default permission if no config', async () => {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({totalCount: 1, list: [{system: false}]})
            };

            const recordPermDomain = recordPermissionDomain({
                'core.domain.permission': mockPermDomain as IPermissionDomain,
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.permission.library': mockLibPermDomain as ILibraryPermissionDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissionsActions.ACCESS_RECORD,
                '987654',
                'test_lib',
                '123456',
                ctx
            );

            expect(mockLibPermDomain.getLibraryPermission).toBeCalled();
            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getHeritedRecordPermission', () => {
        test('Return herited tree permission', async () => {
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));
            const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
                getHeritedTreePermission: global.__mockPromise(true)
            };

            const recordPermDomain = recordPermissionDomain({
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain
            });

            const perm = await recordPermDomain.getHeritedRecordPermission(
                RecordPermissionsActions.ACCESS_RECORD,
                '12345',
                'test_lib',
                'test_tree',
                {id: '54321', library: 'some_lib'},
                ctx
            );

            expect(perm).toBe(true);
        });
    });
});
