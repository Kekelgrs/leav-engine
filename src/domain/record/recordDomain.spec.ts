import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {AttributeTypes} from '../../_types/attribute';
import {mockAttrAdvMultiVal, mockAttrAdvVersionable, mockAttrId} from '../../__tests__/mocks/attribute';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain from './recordDomain';

describe('RecordDomain', () => {
    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };

    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const createdRecordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};
            const recRepo: Mockify<IRecordRepo> = {createRecord: global.__mockPromise(createdRecordData)};

            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                null,
                null,
                null,
                mockRecordPermDomain as IRecordPermissionDomain
            );

            const createdRecord = await recDomain.createRecord('test');
            expect(recRepo.createRecord.mock.calls.length).toBe(1);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][1].created_at)).toBe(true);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(createdRecord).toMatchObject(createdRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function() {
            const updatedRecordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 987654321};
            const recRepo: Mockify<IRecordRepo> = {updateRecord: global.__mockPromise(updatedRecordData)};

            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                null,
                null,
                null,
                mockRecordPermDomain as IRecordPermissionDomain
            );

            const updatedRecord = await recDomain.updateRecord(
                'test',
                {id: 222435651, modified_at: 987654321},
                {userId: 1}
            );

            expect(recRepo.updateRecord.mock.calls.length).toBe(1);
            expect(Number.isInteger(recRepo.updateRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(updatedRecord).toMatchObject(updatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        const recordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};

        test('Should delete an record and return deleted record', async function() {
            const recRepo: Mockify<IRecordRepo> = {deleteRecord: global.__mockPromise(recordData)};
            const recordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };
            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                null,
                null,
                null,
                recordPermDomain as IRecordPermissionDomain
            );

            const deleteRes = await recDomain.deleteRecord('test', recordData.id, {userId: 1});

            expect(recRepo.deleteRecord.mock.calls.length).toBe(1);
        });

        // TODO: handle unknown record?
        // test('Should throw if unknown record', async function() {
        //     const mockLibRepo = {deleteRecord: global.__mockPromise(recordData)};
        //     const recDomain = recordDomain(mockLibRepo);

        //     await expect(recDomain.deleteRecord(recordData.id)).rejects.toThrow();
        // });
    });

    describe('find', () => {
        test('Should find records', async function() {
            const mockRes = [
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};

            const recDomain = recordDomain(recRepo as IRecordRepo, null);

            const findRes = await recDomain.find('test_lib');

            expect(recRepo.find.mock.calls.length).toBe(1);
            expect(findRes).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]);
        });
    });

    describe('populateRecordFields', () => {
        test('Should populate record fields', async function() {
            const record = {
                id: 222536283,
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const recRepo: Mockify<IRecordRepo> = {};

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([
                    {
                        id: '222827150',
                        value: 'MyLabel'
                    }
                ])
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementation(attribute => {
                    let type;
                    switch (attribute) {
                        case 'id':
                            type = AttributeTypes.SIMPLE;
                            break;
                        case 'label':
                            type = AttributeTypes.ADVANCED;
                            break;
                    }

                    return Promise.resolve({id: attribute, type, actions_list: {getValue: [{name: 'formatAttr'}]}});
                })
            };

            const mockALDomain: Mockify<IActionsListDomain> = {
                runActionsList: global.__mockPromise({
                    id: '222827150',
                    value: 'MyLabelProcessed'
                })
            };

            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                mockAttributeDomain as IAttributeDomain,
                mockValDomain as IValueDomain,
                mockALDomain as IActionsListDomain
            );

            const findRes = await recDomain.populateRecordFields('test_lib', record, [
                {
                    name: 'label',
                    fields: [{name: 'id', fields: [], arguments: []}, {name: 'value', fields: [], arguments: []}],
                    arguments: []
                }
            ]);

            expect(mockValDomain.getValues).toBeCalledWith('test_lib', 222536283, 'label', {});
            expect(findRes).toEqual({
                ...record,
                label: {
                    id: '222827150',
                    value: 'MyLabelProcessed',
                    raw_value: 'MyLabel'
                }
            });
        });

        test('Should populate record fields on multiple values', async function() {
            const record = {
                id: 222536283,
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const recRepo: Mockify<IRecordRepo> = {};

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([
                    {
                        id: '1',
                        value: 'MyLabel'
                    },
                    {
                        id: '2',
                        value: 'MyOtherLabel'
                    }
                ])
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementation(attributeName => {
                    const attribute = attributeName === 'id' ? mockAttrId : mockAttrAdvMultiVal;

                    return Promise.resolve(attribute);
                })
            };

            const mockALDomain: Mockify<IActionsListDomain> = {
                runActionsList: jest.fn()
            };

            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                mockAttributeDomain as IAttributeDomain,
                mockValDomain as IValueDomain,
                mockALDomain as IActionsListDomain
            );

            const findRes = await recDomain.populateRecordFields('test_lib', record, [
                {
                    name: 'label',
                    fields: [{name: 'id', fields: [], arguments: []}, {name: 'value', fields: [], arguments: []}],
                    arguments: []
                }
            ]);

            expect(findRes).toEqual({
                ...record,
                label: [
                    {
                        id: '1',
                        value: 'MyLabel',
                        raw_value: 'MyLabel'
                    },
                    {
                        id: '2',
                        value: 'MyOtherLabel',
                        raw_value: 'MyOtherLabel'
                    }
                ]
            });
        });

        test('Should populate record fields recursively', async function() {
            const record = {
                id: 222536283,
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const recRepo: Mockify<IRecordRepo> = {};

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: jest
                    .fn()
                    .mockReturnValueOnce([
                        {
                            id: null,
                            value: {
                                id: '222827150',
                                library: 'linked_library'
                            }
                        }
                    ])
                    .mockReturnValueOnce([
                        {
                            id: '222827150',
                            value: 'MyLabel'
                        }
                    ])
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementation(attribute => {
                    let type;
                    switch (attribute) {
                        case 'id':
                            type = AttributeTypes.SIMPLE;
                            break;
                        case 'label':
                            type = AttributeTypes.ADVANCED;
                            break;
                        case 'linkedElem':
                            type = AttributeTypes.SIMPLE_LINK;
                            break;
                    }

                    return Promise.resolve({
                        id: attribute,
                        type
                    });
                })
            };

            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                mockAttributeDomain as IAttributeDomain,
                mockValDomain as IValueDomain
            );

            const findRes = await recDomain.populateRecordFields('test_lib', record, [
                {name: 'id', fields: [], arguments: []},
                {
                    name: 'linkedElem',
                    fields: [
                        {name: 'id', fields: [], arguments: []},
                        {
                            name: 'value',
                            fields: [
                                {name: 'id', fields: [], arguments: []},
                                {
                                    name: 'label',
                                    fields: [
                                        {name: 'id', fields: [], arguments: []},
                                        {name: 'value', fields: [], arguments: []}
                                    ],
                                    arguments: []
                                }
                            ],
                            arguments: []
                        }
                    ],
                    arguments: []
                }
            ]);

            expect(mockValDomain.getValues).toBeCalledWith('test_lib', 222536283, 'linkedElem', {});
            expect(findRes).toEqual({
                ...record,
                linkedElem: {
                    id: null,
                    value: {
                        id: '222827150',
                        library: 'linked_library',
                        label: {
                            id: '222827150',
                            value: 'MyLabel',
                            raw_value: 'MyLabel'
                        }
                    }
                }
            });
        });

        test('Should populate record fields with version', async function() {
            const record = {
                id: 222536283,
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const recRepo: Mockify<IRecordRepo> = {};

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([
                    {
                        id: '222827150',
                        value: 'MyLabel',
                        version: {
                            my_tree: {library: 'my_lib', id: 123456789}
                        }
                    }
                ])
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const recDomain = recordDomain(
                recRepo as IRecordRepo,
                mockAttributeDomain as IAttributeDomain,
                mockValDomain as IValueDomain,
                null
            );

            const findRes = await recDomain.populateRecordFields(
                'test_lib',
                record,
                [
                    {
                        name: 'label',
                        fields: [
                            {name: 'id_value', fields: [], arguments: []},
                            {name: 'value', fields: [], arguments: []},
                            {name: 'version', fields: [], arguments: []}
                        ],
                        arguments: []
                    }
                ],
                {
                    my_tree: {library: 'my_lib', id: 123456789}
                }
            );

            expect(findRes).toEqual({
                ...record,
                label: {
                    id: '222827150',
                    value: 'MyLabel',
                    raw_value: 'MyLabel',
                    version: {
                        my_tree: {library: 'my_lib', id: 123456789}
                    }
                }
            });
        });
    });

    describe('getRecordIdentity', () => {
        test('Return record identity', async () => {
            const record = {
                id: 222536283,
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                    color: 'color_attr',
                    preview: 'preview_attr'
                }
            };

            const mockLibDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: global.__mockPromise(libData)
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromiseMultiple([
                    [
                        {
                            value: 'Label Value'
                        }
                    ],
                    [
                        {
                            value: '#123456'
                        }
                    ],
                    [
                        {
                            value: 'http://fake-image.com/'
                        }
                    ]
                ])
            };

            const recDomain = recordDomain(
                null,
                null,
                mockValDomain as IValueDomain,
                null,
                null,
                mockLibDomain as ILibraryDomain
            );

            const res = await recDomain.getRecordIdentity(record);

            expect(res.id).toBe(222536283);
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe('Label Value');
            expect(res.color).toBe('#123456');
            expect(res.preview).toBe('http://fake-image.com/');
        });

        test('Return minimum identity if no config', async () => {
            const record = {
                id: 222536283,
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const libData = {
                id: 'test_lib'
            };

            const mockLibDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: global.__mockPromise(libData)
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: jest.fn()
            };

            const recDomain = recordDomain(
                null,
                null,
                mockValDomain as IValueDomain,
                null,
                null,
                mockLibDomain as ILibraryDomain
            );

            const res = await recDomain.getRecordIdentity(record);

            expect(res.id).toBe(222536283);
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe(null);
            expect(res.color).toBe(null);
            expect(res.preview).toBe(null);
        });
    });
});
