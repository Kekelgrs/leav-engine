// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('Trees', () => {
    const testTreeName = 'test_tree';
    const testTreeName2 = 'test_tree2';
    const testLibName = 'trees_library_test';
    const testLibTypeName = 'treesLibraryTest';
    const attrTreeName = 'trees_attribute_test_tree';

    test('Create Tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveTree(
                tree: {
                    id: "${testTreeName}",
                    label: {fr: "Test tree"},
                    libraries: [{library: "users", settings: {allowMultiplePositions: true, allowedAtRoot: true,  allowedChildren: ["__all__"]}}]
                }
            ) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveTree.id).toBe(testTreeName);
        expect(res.data.errors).toBeUndefined();

        // Create another one for tests
        await gqlSaveTree(testTreeName2, 'Test tree 2', ['users']);
    });

    test('Get Trees list', async () => {
        const res = await makeGraphQlCall(`{
            trees {
                list {
                    id
                    libraries {
                        library { id }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.list.length).toBeGreaterThanOrEqual(3);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get Tree by ID', async () => {
        const res = await makeGraphQlCall(`{
            trees(filters: {id: "${testTreeName}"}) {
                list {
                    id
                    libraries {
                        library{ id }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.list.length).toBe(1);
        expect(res.data.data.trees.list[0].libraries).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Delete a tree', async () => {
        const treeToDelete = testTreeName + '2';
        const res = await makeGraphQlCall(`mutation {deleteTree(id: "${treeToDelete}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteTree).toBeDefined();
        expect(res.data.data.deleteTree.id).toBe(treeToDelete);
        expect(res.data.errors).toBeUndefined();
    });

    test('Manipulate elements in a tree', async () => {
        // Create some records
        const resCreaRecord = await makeGraphQlCall(`
                mutation {
                    r1: createRecord(library: "users") {id},
                    r2: createRecord(library: "users") {id},
                    r3: createRecord(library: "users") {id},
                    r4: createRecord(library: "users") {id},
                    r5: createRecord(library: "users") {id},
                    r6: createRecord(library: "users") {id}
                }
            `);
        const recordId1 = resCreaRecord.data.data.r1.id;
        const recordId2 = resCreaRecord.data.data.r2.id;
        const recordId3 = resCreaRecord.data.data.r3.id;
        const recordId4 = resCreaRecord.data.data.r4.id;
        const recordId5 = resCreaRecord.data.data.r5.id;
        const recordId6 = resCreaRecord.data.data.r6.id;

        // Add records to the tree
        const resAdd = await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${testTreeName}", element: {id: "${recordId1}", library: "users"}, order: 2
            ) {id},
            a2: treeAddElement(
                treeId: "${testTreeName}", element: {id: "${recordId2}", library: "users"}, order: 1
            ) {id},
            a3: treeAddElement(
                treeId: "${testTreeName}", element: {id: "${recordId3}", library: "users"}, order: 0
            ) {id}
        }`);

        expect(resAdd.status).toBe(200);
        expect(resAdd.data.data.a1).toBeDefined();
        expect(resAdd.data.data.a1.id).toBeTruthy();
        expect(resAdd.data.errors).toBeUndefined();

        // test element already present in ancestors
        await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${testTreeName}", 
                    element: {id: "${recordId5}", library: "users"},
                    order: 1
            ) {id},
            a2: treeAddElement(
                treeId: "${testTreeName}", 
                    element: {id: "${recordId6}", library: "users"},
                    parent: {id: "${recordId5}", library: "users"}, 
                    order: 1
            ) {id},
        }`);

        const resErr = await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${testTreeName}", 
                    element: {id: "${recordId5}", library: "users"}, 
                    parent: {id: "${recordId6}", library: "users"}, 
                    order: 2
            ) {id}
        }`);

        expect(resErr.status).toBe(200);
        expect(resErr.data.data).toBeNull();
        expect(resErr.data.errors).toBeDefined();
        expect(resErr.data.errors[0].message).toBeDefined();
        expect(resErr.data.errors[0].extensions.fields).toBeDefined();

        await makeGraphQlCall(`mutation {
            a4: treeAddElement(
                treeId: "${testTreeName}",
                element: {
                    id: "${recordId4}",
                    library: "users"
                },
                parent: {id: "${recordId1}", library: "users"}
            ) {id}
        }`);

        // Move records inside the tree
        const resMove = await makeGraphQlCall(`mutation {
                treeMoveElement(
                    treeId: "${testTreeName}",
                    element: {id: "${recordId1}", library: "users"}
                    parentTo: {id: "${recordId2}", library: "users"}
                ) {
                    id
                }
            }`);

        expect(resMove.status).toBe(200);
        expect(resMove.data.data.treeMoveElement).toBeDefined();
        expect(resMove.data.data.treeMoveElement.id).toBeTruthy();
        expect(resMove.data.errors).toBeUndefined();

        // Get tree content
        const restreeContent = await makeGraphQlCall(`
        {
            treeContent(treeId: "${testTreeName}") {
                order
                record {
                    id
                    library {
                        id
                    }
                }
                children {
                    record {
                        id
                        library {
                            id
                        }
                    }
                }
            }
        }
        `);

        expect(restreeContent.status).toBe(200);
        expect(restreeContent.data.data.treeContent).toBeDefined();
        expect(Array.isArray(restreeContent.data.data.treeContent)).toBe(true);
        expect(restreeContent.data.data.treeContent).toHaveLength(3);
        expect(restreeContent.data.data.treeContent[0].record.library.id).toBeTruthy();
        expect(restreeContent.data.data.treeContent[0].order).toBe(0);
        expect(restreeContent.data.data.treeContent[1].order).toBe(1);
        expect(restreeContent.data.data.treeContent[0].record.id).toBe(recordId3);
        expect(restreeContent.data.data.treeContent[1].record.id).toBe(recordId2);
        expect(restreeContent.data.errors).toBeUndefined();

        // Get tree content from a specific node
        // Get tree content
        const restreeContentPartial = await makeGraphQlCall(`
        {
            treeContent(treeId: "${testTreeName}", startAt: {id: "${recordId2}", library: "users"}) {
                record {
                    id
                    library {
                        id
                    }
                }
                children {
                    record {
                        id
                        library {
                            id
                        }
                    }
                }
            }
        }
        `);

        expect(restreeContentPartial.status).toBe(200);
        expect(restreeContentPartial.data.data.treeContent).toBeDefined();
        expect(restreeContentPartial.data.data.treeContent).toHaveLength(1);
        expect(restreeContentPartial.data.errors).toBeUndefined();

        // Delete element from the tree
        const resDel = await makeGraphQlCall(`mutation {
            treeDeleteElement(
                treeId: "${testTreeName}",
                element: {id: "${recordId3}", library: "users"}
            ) {
                id
            }
        }`);

        expect(resDel.status).toBe(200);
        expect(resDel.data.data.treeDeleteElement).toBeDefined();
        expect(resDel.data.data.treeDeleteElement.id).toBeTruthy();
        expect(resDel.data.errors).toBeUndefined();

        // Create a tree attribute
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeName}",
                    type: tree,
                    linked_tree: "${testTreeName}",
                    format: text,
                    label: {fr: "Test attr tree"}
                }
            ) { id }
        }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        // Create library for tests
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                label: {fr: "Test lib"},
            }) { id }
        }`);

        // Add tree attribute to library
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                attributes: [
                    "id",
                    "modified_by",
                    "modified_at",
                    "created_by",
                    "created_at",
                    "${attrTreeName}"
                ]
            }) { id }
        }`);

        // Create a record to link to the tree
        const resCreaTestRecord = await makeGraphQlCall(`
                mutation {
                    r1: createRecord(library: "${testLibName}") {id}
                }
            `);

        const testRecordId = resCreaTestRecord.data.data.r1.id;

        // Save a value to the tree attribute = link record to the tree
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${testRecordId}",
                    attribute: "${attrTreeName}",
                    value: {value: "users/${recordId1}"}) { id_value value }
                }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id_value).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe(`users/${recordId1}`);

        // Get values of this attribute
        const resGetValues = await makeGraphQlCall(`{
            valElement: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                record {
                                    ... on User {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            },
            valParents: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                record {
                                    id
                                },
                                ancestors {
                                    record {
                                        ... on User {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            valChildren: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                record {
                                    id
                                },
                                children {
                                    record {
                                        ... on User {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            valLinkedRecords: ${testLibTypeName} {
                list {
                    id
                    property(attribute: "${attrTreeName}") {
                        id_value
                        ... on TreeValue {
                            value {
                                record {
                                    id
                                },
                                linkedRecords(attribute: "${attrTreeName}") {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }`);

        expect(resGetValues.status).toBe(200);
        expect(resGetValues.data.errors).toBeUndefined();
        const resData = resGetValues.data.data;

        expect(resData.valElement.list[0].property[0].id_value).toBeTruthy();
        expect(typeof resData.valElement.list[0].property[0].value).toBe('object');
        expect(resData.valElement.list[0].property[0].value.record.id).toBeTruthy();

        expect(resData.valParents.list[0].property[0].value.ancestors).toBeInstanceOf(Array);
        expect(resData.valParents.list[0].property[0].value.ancestors.length).toBe(1);
        expect(resData.valParents.list[0].property[0].value.ancestors[0]).toBeInstanceOf(Array);
        expect(resData.valParents.list[0].property[0].value.ancestors[0].length).toBe(2);

        expect(resData.valChildren.list[0].property[0].value.children).toBeInstanceOf(Array);
        expect(resData.valChildren.list[0].property[0].value.children.length).toBe(1);

        expect(resData.valLinkedRecords.list[0].property[0].value.linkedRecords).toBeInstanceOf(Array);
        expect(resData.valLinkedRecords.list[0].property[0].value.linkedRecords.length).toBe(1);
    });
});
