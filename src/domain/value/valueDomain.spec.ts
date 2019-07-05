import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IValue, IValueVersion} from '_types/value';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {mockAttrAdv, mockAttrAdvVersionable, mockAttrAdvVersionableSimple} from '../../__tests__/mocks/attribute';
import {mockTree} from '../../__tests__/mocks/tree';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IAttributePermissionDomain} from '../permission/attributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import valueDomain from './valueDomain';

describe('ValueDomain', () => {
    const mockRecordRepo: Mockify<IRecordRepo> = {
        updateRecord: jest.fn()
    };

    const mockActionsListDomain: Mockify<IActionsListDomain> = {
        runActionsList: global.__mockPromise({value: 'test val'})
    };

    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };

    const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
        getAttributePermission: global.__mockPromise(true)
    };

    const mockAttribute = {
        id: 'test_attr',
        actions_list: {
            saveValue: [{name: 'validate'}]
        },
        type: AttributeTypes.SIMPLE
    };

    describe('saveValue', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            isElementPresent: global.__mockPromise(true),
            getTrees: global.__mockPromise([mockTree])
        };

        test('Should save an indexed value', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            const savedValue = await valDomain.saveValue(
                'test_lib',
                12345,
                'test_attr',
                {value: 'test val'},
                {userId: 1}
            );

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockActionsListDomain.runActionsList.mock.calls.length).toBe(1);
            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a new standard value', async function() {
            const savedValueData = {
                id_value: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            const savedValue = await valDomain.saveValue(
                'test_lib',
                12345,
                'test_attr',
                {value: 'test val'},
                {userId: 1}
            );

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][3].modified_at).toBeDefined();
            expect(mockValRepo.createValue.mock.calls[0][3].created_at).toBeDefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id_value).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should update a standard value', async function() {
            const savedValueData = {
                id_value: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                updateValue: global.__mockPromise(savedValueData),
                getValueById: global.__mockPromise({
                    id_value: 12345
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            const savedValue = await valDomain.saveValue(
                'test_lib',
                12345,
                'test_attr',
                {
                    id_value: 12345,
                    value: 'test val'
                },
                {userId: 1}
            );

            expect(mockValRepo.updateValue.mock.calls.length).toBe(1);
            expect(mockValRepo.updateValue.mock.calls[0][3].modified_at).toBeDefined();
            expect(mockValRepo.updateValue.mock.calls[0][3].created_at).toBeUndefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id_value).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: 'Unknown attribute ' + id});
                })
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                null,
                null,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'}, {userId: 1})
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                null,
                null,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'}, {userId: 1})
            ).rejects.toThrow();
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                null,
                null,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            await expect(
                valDomain.saveValue(
                    'test_lib',
                    12345,
                    'test_attr',
                    {
                        id_value: 12345,
                        value: 'test val'
                    },
                    {userId: 1}
                )
            ).rejects.toThrow();
        });

        test('Should update record modif date', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockRecRepo = {updateRecord: global.__mockPromise({})};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            const savedValue = await valDomain.saveValue(
                'test_lib',
                12345,
                'test_attr',
                {value: 'test val'},
                {userId: 1}
            );

            expect(mockRecRepo.updateRecord).toBeCalled();
            expect(mockRecRepo.updateRecord.mock.calls[0][1].modified_at).toBeDefined();
            expect(Number.isInteger(mockRecRepo.updateRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a versioned value', async () => {
            const savedValueData: IValue = {
                id_value: 1337,
                value: 'test val',
                attribute: 'advanced_attribute',
                modified_at: 123456,
                created_at: 123456,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            const savedValue = await valDomain.saveValue(
                'test_lib',
                12345,
                'test_attr',
                {
                    value: 'test val',
                    version: {
                        my_tree: {
                            id: 1,
                            library: 'test_lib'
                        }
                    }
                },
                {userId: 1}
            );

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][3].version).toBeDefined();
            expect(savedValue.version).toBeTruthy();
        });

        test('Should throw when saving version on a non versionable attribute', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdv)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepo as ITreeRepo
            );

            await expect(
                valDomain.saveValue(
                    'test_lib',
                    12345,
                    'test_attr',
                    {
                        value: 'test val',
                        version: {
                            my_tree: {
                                id: 1,
                                library: 'test_lib'
                            }
                        }
                    },
                    {userId: 1}
                )
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if version is incorrect: unknown tree', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockTreeRepoNoTree: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise([])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepoNoTree as ITreeRepo
            );

            await expect(
                valDomain.saveValue(
                    'test_lib',
                    12345,
                    'test_attr',
                    {
                        value: 'test val',
                        version: {
                            my_tree: {
                                id: 1,
                                library: 'test_lib'
                            }
                        }
                    },
                    {userId: 1}
                )
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if version is incorrect: bad tree node', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                ...mockTreeRepo,
                isElementPresent: global.__mockPromise(false)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain,
                mockTreeRepoNotPresent as ITreeRepo
            );

            await expect(
                valDomain.saveValue(
                    'test_lib',
                    12345,
                    'test_attr',
                    {
                        value: 'test val',
                        version: {
                            my_tree: {
                                id: 1,
                                library: 'test_lib'
                            }
                        }
                    },
                    {userId: 1}
                )
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                deleteValue: global.__mockPromise(deletedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                null,
                mockRecordPermDomain as IRecordPermissionDomain,
                mockAttrPermDomain as IAttributePermissionDomain
            );

            const deletedValue = await valDomain.deleteValue(
                'test_lib',
                12345,
                'test_attr',
                {value: 'test val'},
                {userId: 1}
            );

            expect(mockValRepo.deleteValue.mock.calls.length).toBe(1);
            expect(deletedValue).toMatchObject(deletedValueData);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: 'Unknown attribute ' + id});
                })
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(mockAttrDomain as IAttributeDomain, mockLibDomain as ILibraryDomain);

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'}, {userId: 1})
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const valDomain = valueDomain(mockAttrDomain as IAttributeDomain, mockLibDomain as ILibraryDomain);

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'}, {userId: 1})
            ).rejects.toThrow();
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(mockAttrDomain as IAttributeDomain, mockLibDomain as ILibraryDomain);

            await expect(
                valDomain.saveValue(
                    'test_lib',
                    12345,
                    'test_attr',
                    {
                        id_value: 12345,
                        value: 'test val'
                    },
                    {userId: 1}
                )
            ).rejects.toThrow();
        });
    });

    describe('getValues', () => {
        test('Should return values', async function() {
            const valueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain
            );

            const resValue = await valDomain.getValues('test_lib', 12345, 'test_attr');

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(resValue).toMatchObject(valueData);
        });

        test('Should return versioned values in simple mode', async function() {
            const version = {my_tree: {library: 'my_lib', id: 12345}};
            const valueData = {
                value: 'test val',
                attribute: 'test_attr',
                version
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionableSimple)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain
            );

            const resValue = await valDomain.getValues('test_lib', 12345, 'test_attr', {version});

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][3]).toBe(false);
            expect(mockValRepo.getValues.mock.calls[0][4]).toMatchObject({version});
            expect(resValue).toMatchObject(valueData);
        });

        test('Should return versioned values in smart mode', async function() {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 7, library: 'my_lib'}
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 8, library: 'my_lib'}
                    }
                }
            ];

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getElementAncestors: global.__mockPromise([
                    {
                        record: {
                            id: 9,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 8,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 7,
                            library: 'my_lib'
                        }
                    }
                ])
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                null,
                null,
                mockTreeRepo as ITreeRepo
            );

            const version: IValueVersion = {
                my_tree: {id: 9, library: 'my_lib'}
            };

            const resValue = await valDomain.getValues('test_lib', 12345, 'test_attr', {version});

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][4]).toMatchObject({version});
            expect(mockTreeRepo.getElementAncestors).toBeCalledTimes(1);
            expect(resValue.length).toBe(1);
            expect(resValue[0].value).toBe('val2');
            expect(resValue[0].version).toMatchObject({
                my_tree: {id: 8, library: 'my_lib'}
            });
        });

        test('Should return versioned values with multiple trees', async function() {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 9, library: 'my_lib'},
                        other_tree: {id: 1, library: 'my_lib'},
                        third_tree: {id: 88, library: 'my_lib'}
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 8, library: 'my_lib'},
                        other_tree: {id: 2, library: 'my_lib'},
                        third_tree: {id: 99, library: 'my_lib'}
                    }
                },
                {
                    value: 'val3',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 8, library: 'my_lib'},
                        other_tree: {id: 2, library: 'my_lib'},
                        third_tree: {id: 99, library: 'my_lib'}
                    }
                },
                {
                    value: 'val4',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 9, library: 'my_lib'},
                        other_tree: {id: 2, library: 'my_lib'},
                        third_tree: {id: 88, library: 'my_lib'}
                    }
                }
            ];

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getElementAncestors: jest.fn().mockImplementation((treeId, elem) => {
                    let parents;
                    switch (treeId) {
                        case 'my_tree':
                            parents = [
                                {
                                    record: {
                                        id: 9,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 8,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 7,
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                        case 'other_tree':
                            parents = [
                                {
                                    record: {
                                        id: 3,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 2,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 1,
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                        case 'third_tree':
                            parents = [
                                {
                                    record: {
                                        id: 99,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 88,
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                    }

                    return Promise.resolve(parents);
                })
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrAdvVersionableWithThreeTrees = {
                ...mockAttrAdvVersionable,
                versions_conf: {
                    versionable: true,
                    trees: ['my_tree', 'other_tree', 'third_tree']
                }
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionableWithThreeTrees)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                null,
                null,
                mockTreeRepo as ITreeRepo
            );

            const version: IValueVersion = {
                my_tree: {id: 9, library: 'my_lib'},
                other_tree: {id: 3, library: 'my_lib'},
                third_tree: {id: 99, library: 'my_lib'}
            };

            const resValue = await valDomain.getValues('test_lib', 12345, 'test_attr', {version});

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][4]).toMatchObject({version});
            expect(mockTreeRepo.getElementAncestors).toBeCalledTimes(3);
            expect(resValue.length).toBe(2);
            expect(resValue[0].value).toBe('val2');
            expect(resValue[1].value).toBe('val3');
            expect(resValue[0].version).toMatchObject({
                my_tree: {id: 8, library: 'my_lib'},
                other_tree: {id: 2, library: 'my_lib'},
                third_tree: {id: 99, library: 'my_lib'}
            });
        });

        test('Should return empty array if no values matching version', async function() {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 99, library: 'my_lib'}
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 88, library: 'my_lib'}
                    }
                }
            ];

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getElementAncestors: global.__mockPromise([
                    {
                        record: {
                            id: 9,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 8,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 7,
                            library: 'my_lib'
                        }
                    }
                ])
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo,
                mockActionsListDomain as IActionsListDomain,
                null,
                null,
                mockTreeRepo as ITreeRepo
            );

            const version: IValueVersion = {
                my_tree: {id: 9, library: 'my_lib'}
            };

            const resValue = await valDomain.getValues('test_lib', 12345, 'test_attr', {version});

            expect(resValue.length).toBe(0);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: 'Unknown attribute ' + id});
                })
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo
            );

            await expect(valDomain.getValues('test_lib', 12345, 'test_attr')).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo
            );

            await expect(valDomain.getValues('test_lib', 12345, 'test_attr')).rejects.toThrow();
        });
    });
});
