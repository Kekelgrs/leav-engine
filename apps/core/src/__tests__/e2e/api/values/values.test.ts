// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {gqlSaveAttribute, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('Values', () => {
    const testLibName = 'values_library_test';

    const treeName = 'tree_test';
    const treeLibName = 'tree_library_test';

    const attrSimpleName = 'values_attribute_test_simple';
    const attrSimpleExtendedName = 'values_attribute_test_simple_extended';
    const attrSimpleLinkName = 'values_attribute_test_simple_link';
    const attrAdvancedName = 'values_attribute_test_adv';
    const attrAdvancedLinkName = 'values_attribute_test_adv_link';
    const attrTreeName = 'values_attribute_test_tree';
    const attrDateRangeName = 'test_attr_date_range';

    let recordId;
    let recordIdBatch;
    let recordIdLinked;
    let advValueId;
    let treeElemId;

    beforeAll(async done => {
        // Create attributes
        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleName}",
                        type: simple,
                        format: text,
                        label: {fr: "Test attr simple"},
                        actions_list: {
                            saveValue: [
                                {id: "validateFormat",},
                                {id: "validateRegex", params: [{name: "regex", value: "^TEST"}]}
                            ]
                        }
                    }
                ) {
                    id
                }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleExtendedName}",
                        type: simple,
                        format: extended,
                        label: {fr: "Test attr simple étendu"},
                        embedded_fields: [
                            {
                                format: text,
                                id: "street"
                            },
                            {
                                embedded_fields: [
                                    {
                                        format: text,
                                        id: "zipcode",
                                        validation_regex: "^[0-9]{5}$"
                                    },
                                    {
                                        format: text,
                                        id: "name"
                                    }
                                ],
                                format: extended,
                                id: "city"
                            }
                        ]
                    }
                ) {
                    id
                }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedName}",
                        type: advanced,
                        format: text,
                        label: {fr: "Test attr advanced"}
                    }
                ) { id }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleLinkName}",
                        type: simple_link,
                        format: text,
                        linked_library: "${testLibName}",
                        label: {fr: "Test attr simple link"}
                    }
                ) { id }
            }`);

        await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedLinkName}",
                        type: advanced_link,
                        format: text,
                        linked_library: "${testLibName}",
                        label: {fr: "Test attr advanced link"}
                    }
                ) { id }
            }`);

        await gqlSaveAttribute({
            id: attrDateRangeName,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.DATE_RANGE,
            label: 'Test attr date range'
        });

        // Create library to use in tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${treeLibName}", label: {fr: "Test tree lib"}}) { id }
        }`);

        // create tree
        await gqlSaveTree(treeName, 'Test tree', [treeLibName]);

        // Create tree attribute linking to tree
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    label: {fr: "Test tree attr"}
                }
            ) { id }
        }`);

        // Create library
        await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${testLibName}",
                    label: {fr: "Test lib"},
                    attributes: [
                        "id",
                        "modified_by",
                        "modified_at",
                        "created_by",
                        "created_at",
                        "${attrSimpleName}",
                        "${attrAdvancedName}",
                        "${attrSimpleLinkName}",
                        "${attrAdvancedLinkName}",
                        "${attrSimpleExtendedName}",
                        "${attrTreeName}",
                        "${attrDateRangeName}"
                    ]
                }) { id }
            }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        // Create records
        const resRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}") { id },
            c2: createRecord(library: "${testLibName}") { id },
            c3: createRecord(library: "${testLibName}") { id },
            c4: createRecord(library: "${treeLibName}") { id },
        }`);

        recordId = resRecord.data.data.c1.id;
        recordIdBatch = resRecord.data.data.c2.id;
        recordIdLinked = resRecord.data.data.c3.id;
        treeElemId = resRecord.data.data.c4.id;

        // Add element to tree
        await makeGraphQlCall(`mutation {
            treeAddElement(
                treeId: "${treeName}",
                element: {id: "${treeElemId}", library: "${treeLibName}"}
            ) {
                id
            }
        }`);

        done();
    });

    test('Save value tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrTreeName}",
                value: {value: "${treeLibName}/${treeElemId}"}) {
                    id_value

                    ... on TreeValue {
                        value {
                            record {
                                id
                            }
                        }
                    }
                }
            }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value.record.id).toBe(treeElemId);
    });

    test('Save value simple', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "TEST VAL"}
                ) {
                    id_value
                    attribute {
                        permissions {
                            edit_value
                        }
                    }

                    ... on Value {
                        value
                    }
                }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeNull();
        expect(res.data.data.saveValue.attribute?.permissions.edit_value).toBeDefined();
        expect(res.data.data.saveValue.value).toBe('TEST VAL');
    });

    test("Don't save invalid value", async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "AAAATEST VAL"}) {
                        id_value

                        ... on Value {
                            value
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].extensions.fields[attrSimpleName]).toBeDefined();
    });

    test('Save value simple extended', async () => {
        const query = `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleExtendedName}",
                    value: {
                        value: "{\\"city\\": {\\"name\\": \\"Gre\\", \\"zipcode\\": \\"38000\\"}, \\"street\\": \\"Name\\"}"
                    }
                ) {
                    id_value

                    ... on Value {
                        value
                    }
                }
            }`;

        const res = await makeGraphQlCall(query);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeNull();
        expect(res.data.data.saveValue.value).toBeTruthy();
    });

    test("Don't save invalid simple extended", async () => {
        const query = `mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrSimpleExtendedName}",
                value: {
                    value: "{\\"city\\": {\\"name\\": \\"Gre\\", \\"zipcode\\": \\"3800\\"}, \\"street\\": \\"Name\\"}"
                }
            ) {
                id_value

                ... on Value {
                    value
                }
            }
        }`;

        const res = await makeGraphQlCall(query);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].extensions.fields[attrSimpleExtendedName]).toBeDefined();
    });

    test('Save value simple link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleLinkName}",
                    value: {value: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            value {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeNull();
        expect(res.data.data.saveValue.value.id).toBe(recordIdLinked);
    });

    test('Save value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {value: "TEST VAL ADV"}) {
                        id_value

                        ... on Value {
                            value
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe('TEST VAL ADV');

        advValueId = res.data.data.saveValue.id_value;
    });

    test('Save value advanced link', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {value: "${recordIdLinked}"}) {
                        id_value

                        ... on LinkValue {
                            value {
                                id
                            }
                        }
                    }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value.id).toBe(recordIdLinked);
    });

    test('Delete value advanced', async () => {
        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    valueId: "${advValueId}") { id_value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue.id_value).toBeTruthy();
    });

    test('Delete value simple', async () => {
        const res = await makeGraphQlCall(`mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}") { id_value }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
    });

    test('Save value batch', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveValueBatch(
                library: "${testLibName}",
                recordId: "${recordIdBatch}",
                values: [
                    {
                      attribute: "${attrSimpleName}",
                      value: "TEST"
                    },
                    {
                      attribute: "${attrAdvancedName}",
                      id_value: null,
                      value: "some value"
                    }
                ]
            ) {
                values {
                    id_value

                    ... on Value {
                        value
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValueBatch.values).toHaveLength(2);
        expect(res.data.data.saveValueBatch.values[1].id_value).toBeTruthy();
    });

    describe('Date range attribute', () => {
        test('Save and get date range value', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrDateRangeName}",
                    value: {
                        value: "{\\"from\\": 1000, \\"to\\": 2000}"
                    }
                ) {
                    id_value

                    ... on Value {
                        value
                    }
                }
              }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue.value).toEqual({
                from: '1970-01-01T00:16:40+00:00',
                to: '1970-01-01T00:33:20+00:00'
            });
        });

        test("Don't save value if invalid (from > to)", async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrDateRangeName}",
                    value: {
                        value: "{\\"from\\": 2000, \\"to\\": 1000}"
                    }
                ) {
                    id_value

                    ... on Value {
                        value
                    }
                }
              }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeDefined();
            expect(res.data.errors[0].extensions.fields[attrDateRangeName]).toBeDefined();
        });
    });
});
