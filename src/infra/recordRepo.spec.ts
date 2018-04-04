import recordRepo from './recordRepo';
import {Database} from 'arangojs';
import {IAttribute, AttributeTypes} from '../_types/attribute';
import {IRecordFilterOption} from '_types/record';
import {cloneDeep} from 'lodash';
import {IAttributeTypeRepo} from './attributeTypesRepo';

describe('RecordRepo', () => {
    const mockAttrTypeRepo: IAttributeTypeRepo = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValues: null,
        getValueById: null,
        filterQueryPart: null,
        clearAllValues: null
    };

    const mockValueRepo = {
        createValue: jest.fn(),
        updateValue: jest.fn(),
        deleteValue: jest.fn(),
        getValues: jest.fn(),
        getValueById: global.__mockPromise(null),
        clearAllValues: jest.fn()
    };

    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const recordData = {created_at: 1519303348, modified_at: 1519303348};
            const createdRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const cleanCreatedRecordData = {
                id: 222435651,
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                save: global.__mockPromise(createdRecordData),
                document: global.__mockPromise(createdRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(cleanCreatedRecordData)
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils);

            const createdRecord = await recRepo.createRecord('test', recordData);
            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith(recordData);

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(mockDbUtils.cleanup.mock.calls[0][0].hasOwnProperty('library')).toBe(true);

            expect(createdRecord).toMatchObject(cleanCreatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        test('Should delete a record and return deleted record', async function() {
            const recordData = {id: 222435651, created_at: 1519303348, modified_at: 1519303348};
            const deletedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                remove: global.__mockPromise(deletedRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const mockDbUtils = {cleanup: jest.fn().mockReturnValue(recordData)};

            const recRepo = recordRepo(mockDbServ, mockDbUtils);

            const deleteRes = await recRepo.deleteRecord('users', recordData.id);

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: recordData.id});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(deleteRes).toMatchObject(recordData);
        });
    });

    describe('find', () => {
        test('Should find records', async function() {
            const mockQueryRes = [
                {
                    _key: '222536283',
                    _id: 'ubs/222536283',
                    _rev: '_WgM_51a--_',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                },
                {
                    _key: '222536515',
                    _id: 'ubs/222536515',
                    _rev: '_WgFARB6--_',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const mockDbUtils = {
                cleanup: jest
                    .fn()
                    .mockReturnValueOnce(mockCleanupRes[0])
                    .mockReturnValueOnce(mockCleanupRes[1])
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils);

            const records = await recRepo.find('test_lib');
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();

            expect(records).toEqual(mockCleanupRes);
        });
    });

    describe('find with filters', () => {
        const mockFilters: IRecordFilterOption[] = [
            {
                attribute: {
                    id: 'test_attr',
                    type: null
                },
                value: 'test'
            },
            {
                attribute: {
                    id: 'test_attr2',
                    type: null
                },
                value: 'test2'
            }
        ];

        test('Should filter records - simple', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: '222536515',
                        _id: 'test_lib/222536515',
                        _rev: '_WgM_51a--_',
                        created_at: 1520931427,
                        modified_at: 1520931427,
                        test_attr: 'test'
                    }
                ])
            };

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue({
                    id: '222536515',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    test_attr: 'test'
                })
            };

            const mockAttrSimpleRepo = {
                ...mockAttrTypeRepo,
                filterQueryPart: jest
                    .fn()
                    .mockReturnValueOnce({
                        query: 'FILTER r.@filterField0 == @filterValue0',
                        bindVars: {
                            filterField0: 'test_attr',
                            filterValue0: 'test'
                        }
                    })
                    .mockReturnValueOnce({
                        query: 'FILTER r.@filterField1 == @filterValue1',
                        bindVars: {
                            filterField1: 'test_attr2',
                            filterValue1: 'test2'
                        }
                    })
            };

            const mockAttrRepo = {
                getTypeRepo: jest.fn().mockReturnValue(mockAttrSimpleRepo)
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils, mockAttrRepo);

            const filters = cloneDeep(mockFilters);
            filters[0].attribute.type = AttributeTypes.SIMPLE;
            filters[1].attribute.type = AttributeTypes.SIMPLE;

            const records = await recRepo.find('test_lib', filters);

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();
            expect(mockAttrSimpleRepo.filterQueryPart).toBeCalled();
            expect(records).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    test_attr: 'test'
                }
            ]);
        });
    });
});
