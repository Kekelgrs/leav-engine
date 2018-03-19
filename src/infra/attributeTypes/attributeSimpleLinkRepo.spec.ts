import attributeSimpleLinkRepo from './attributeSimpleLinkRepo';
import {AttributeTypes} from '../../_types/attribute';
import {Database} from 'arangojs';
import {IAttributeTypeRepo} from '../attributeRepo';

describe('AttributeIndexRepo', () => {
    const mockAttribute = {
        id: 'test_simple_link_attr',
        type: AttributeTypes.SIMPLE_LINK
    };

    const mockAttrSimpleRepo: IAttributeTypeRepo = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValueById: null,
        getValues: null
    };

    describe('createValue', () => {
        test('Should create a new index value', async function() {
            const updatedValueData = {
                value: 123456
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                createValue: global.__mockPromise(updatedValueData),
                updateValue: global.__mockPromise(updatedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo(null, attrSimpleRepo, null);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 123456
            });

            expect(attrSimpleRepo.createValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.createValue).toBeCalledWith('test_lib', 12345, mockAttribute, {
                value: 123456
            });

            expect(createdVal).toMatchObject(updatedValueData);
        });
    });

    describe('getValues', () => {
        test('Should return values for index attribute', async function() {
            const queryRes = [
                {
                    _key: '987654',
                    _id: 'images/987654',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225
                },
                {
                    _key: '987655',
                    _id: 'images/987655',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: 987654,
                    created_at: 1521475225,
                    modified_at: 1521475225
                })
                .mockReturnValueOnce({
                    id: 987655,
                    created_at: 1521475225,
                    modified_at: 1521475225
                });

            const mockDbUtils = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeSimpleLinkRepo(mockDbServ, null, mockDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(mockDbUtils.cleanup.mock.calls.length).toBe(2);

            expect(values.length).toBe(2);

            expect(values[0]).toMatchObject({
                id: 987654,
                created_at: 1521475225,
                modified_at: 1521475225
            });

            expect(values[1]).toMatchObject({
                id: 987655,
                created_at: 1521475225,
                modified_at: 1521475225
            });
        });
    });
});
