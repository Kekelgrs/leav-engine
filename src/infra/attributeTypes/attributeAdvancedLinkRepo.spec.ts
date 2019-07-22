import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {AttributeTypes} from '../../_types/attribute';
import {IValue} from '../../_types/value';
import attributeAdvancedLinkRepo from './attributeAdvancedLinkRepo';

describe('AttributeAdvancedLinkRepo', () => {
    const mockAttribute = {
        id: 'test_adv_link_attr',
        type: AttributeTypes.ADVANCED_LINK,
        linked_library: 'test_linked_lib',
        multiple_values: true
    };

    const savedEdgeData = {
        _id: 'core_edge_values_links/222435651',
        _rev: '_WSywvyC--_',
        _from: 'test_lib/12345',
        _to: 'test_linked_lib/987654',
        _key: 978654321,
        attribute: 'test_adv_link_attr',
        modified_at: 400999999,
        created_at: 400999999,
        version: {
            my_tree: {
                id: 1,
                library: 'test_lib'
            }
        }
    };

    const valueData: IValue = {
        id_value: 978654321,
        value: 987654,
        attribute: 'test_adv_link_attr',
        modified_at: 400999999,
        created_at: 400999999
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        convertValueVersionToDb: jest.fn().mockReturnValue({my_tree: 'test_lib/1'}),
        convertValueVersionFromDb: jest.fn().mockReturnValue({
            my_tree: {
                id: 1,
                library: 'test_lib'
            }
        })
    };

    describe('createValue', () => {
        test('Should create a new advanced link value', async function() {
            const mockDbEdgeCollec = {
                save: global.__mockPromise(savedEdgeData),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtils as IDbUtils);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 987654,
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
            });

            expect(mockDbEdgeCollec.save.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.save).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'test_linked_lib/987654',
                attribute: 'test_adv_link_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: 'test_lib/1'
                }
            });

            expect(createdVal).toMatchObject({
                id_value: 978654321,
                value: 987654,
                attribute: 'test_adv_link_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
            });
        });
    });

    describe('updateValue', () => {
        test('Should update a advanced link value', async function() {
            const mockDbEdgeCollec = {
                updateByExample: global.__mockPromise(),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtils as IDbUtils);

            const savedVal = await attrRepo.updateValue('test_lib', 12345, mockAttribute, {
                id_value: 987654,
                value: 987654,
                modified_at: 400999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
            });

            expect(mockDbEdgeCollec.updateByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.updateByExample).toBeCalledWith(
                {
                    _key: 987654
                },
                {
                    _from: 'test_lib/12345',
                    _to: 'test_linked_lib/987654',
                    attribute: 'test_adv_link_attr',
                    modified_at: 400999999,
                    version: {
                        my_tree: 'test_lib/1'
                    }
                }
            );

            expect(savedVal).toMatchObject({
                ...valueData,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'test_linked_lib/987654',
                _key: 978654321
            };

            const mockDbEdgeCollec = {
                removeByExample: global.__mockPromise(deletedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, null);

            const deletedVal = await attrRepo.deleteValue('test_lib', 12345, mockAttribute, {
                id_value: 445566,
                value: 987654,
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbEdgeCollec.removeByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.removeByExample).toBeCalledWith({_key: 445566});

            expect(deletedVal).toMatchObject({id_value: 445566});
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function() {
            const traversalRes = [
                {
                    linkedRecord: {
                        _key: '123456',
                        _id: 'images/123456',
                        _rev: '_WgJhrXO--_',
                        created_at: 88888,
                        modified_at: 88888
                    },
                    edge: {
                        _key: '112233',
                        _id: 'core_edge_values_links/112233',
                        _from: 'ubs/222536283',
                        _to: 'images/123456',
                        _rev: '_WgJilsW--_',
                        attribute: 'test_adv_link_attr',
                        modified_at: 99999,
                        created_at: 99999
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValueOnce({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtilsWithCleanup as IDbUtils);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id_value: 112233,
                value: 123456
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(value).toMatchObject({
                id_value: 112233,
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                modified_at: 99999,
                created_at: 99999,
                attribute: 'test_adv_link_attr'
            });
        });

        test("Should return null if value doesn't exists", async function() {
            const traversalRes = [];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, null);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id_value: 112233,
                value: 123456
            });

            expect(value).toBeNull();
        });
    });
    describe('getValues', () => {
        const traversalRes = [
            {
                linkedRecord: {
                    _key: '123456',
                    _id: 'images/123456',
                    _rev: '_WgJhrXO--_',
                    created_at: 88888,
                    modified_at: 88888
                },
                edge: {
                    _key: '112233',
                    _id: 'core_edge_values_links/112233',
                    _from: 'ubs/222536283',
                    _to: 'images/123456',
                    _rev: '_WgJilsW--_',
                    attribute: 'test_adv_link_attr',
                    modified_at: 99999,
                    created_at: 99999
                }
            },
            {
                linkedRecord: {
                    _key: '123457',
                    _id: 'images/123457',
                    _rev: '_WgJhrXO--_',
                    created_at: 77777,
                    modified_at: 77777
                },
                edge: {
                    _key: '112234',
                    _id: 'core_edge_values_links/112234',
                    _from: 'ubs/222536283',
                    _to: 'images/123457',
                    _rev: '_WgJilsW--_',
                    attribute: 'test_adv_link_attr',
                    modified_at: 66666,
                    created_at: 66666
                }
            }
        ];

        test('Should return values for advanced link attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtilsWithCleanup as IDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(2);
            expect(values[0]).toMatchObject({
                id_value: 112233,
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                attribute: 'test_adv_link_attr',
                modified_at: 99999,
                created_at: 99999
            });

            expect(values[1]).toMatchObject({
                id_value: 112234,
                value: {
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                },
                attribute: 'test_adv_link_attr',
                modified_at: 66666,
                created_at: 66666
            });
        });

        test('Should return values filtered by version', async function() {
            const traversalResWithVers = [
                {
                    linkedRecord: {
                        _key: '123457',
                        _id: 'images/123457',
                        _rev: '_WgJhrXO--_',
                        created_at: 77777,
                        modified_at: 77777
                    },
                    edge: {
                        _key: '112233',
                        _id: 'core_edge_values_links/112234',
                        _from: 'ubs/222536283',
                        _to: 'images/123457',
                        _rev: '_WgJilsW--_',
                        attribute: 'test_adv_link_attr',
                        modified_at: 66666,
                        created_at: 66666,
                        version: {
                            my_tree: 'my_lib/1345'
                        }
                    }
                }
            ];
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalResWithVers)
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtilsWithCleanup as IDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute, false, {
                version: {
                    my_tree: {library: 'my_lib', id: 1345}
                }
            });

            expect(values.length).toBe(1);
            expect(values[0].id_value).toBe(112233);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch('FILTER edge.version');
        });

        test('Should return only first value if not multiple attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([traversalRes[0]])
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const mockAttributeNotMultiVal = {
                ...mockAttribute,
                multiple_values: false
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtilsWithCleanup as IDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttributeNotMultiVal);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch('LIMIT 1');
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(1);
            expect(values[0]).toMatchObject({
                id_value: 112233,
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                attribute: 'test_adv_link_attr',
                modified_at: 99999,
                created_at: 99999
            });
        });

        test('Should return all values if forced', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtilsWithCleanup as IDbUtils);

            const mockAttrNotMultival = {
                ...mockAttribute,
                multiple_values: false
            };

            const values = await attrRepo.getValues('test_lib', 123456, mockAttrNotMultival, true);

            expect(values.length).toBe(2);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
        });
    });
});
