// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlAddUserToGroup, gqlGetAllUsersGroupId, gqlSaveLibrary, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('TreeLibraryPermissions', () => {
    const permTreeName = 'tree_library_permissions_test_tree';
    const treeLibId = 'tree_library_permissions_test_lib';
    let allUsersTreeElemId;

    beforeAll(async () => {
        // Create tree
        await gqlSaveLibrary(treeLibId, 'Test lib', []);

        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {
                    id: "${permTreeName}",
                    label: {fr: "Test tree"},
                    libraries: [{library: "${treeLibId}", settings: {allowMultiplePositions: true, allowedAtRoot: true,  allowedChildren: ["__all__"]}}]
                }
            ) {
                id
            }
        }`);

        allUsersTreeElemId = await gqlGetAllUsersGroupId();
        await gqlAddUserToGroup(allUsersTreeElemId);
    });

    describe('Defined permission', () => {
        test('Save and get tree node library permissions', async () => {
            const resSaveTreePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_library,
                        applyTo: "${permTreeName}/${treeLibId}",
                        usersGroup: "${allUsersTreeElemId}",
                        actions: [
                            {name: access_tree, allowed: true},
                            {name: edit_tree, allowed: false},
                            {name: edit_children, allowed: true}
                        ]
                    }
                ) {
                    type
                    usersGroup
                    actions {
                        name
                        allowed
                    }
                }
            }`);

            expect(resSaveTreePerm.status).toBe(200);
            expect(resSaveTreePerm.data.data.savePermission.type).toBe('tree_library');
            expect(resSaveTreePerm.data.errors).toBeUndefined();

            const resGetTreePerm = await makeGraphQlCall(`{
                permissions(
                    type: tree_library,
                    applyTo: "${permTreeName}/${treeLibId}",
                    usersGroup: "${allUsersTreeElemId}",
                    actions: [
                        access_tree,
                        edit_tree,
                        edit_children
                    ]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetTreePerm.status).toBe(200);
            expect(resGetTreePerm.data.data.permissions).toEqual([
                {name: 'access_tree', allowed: true},
                {name: 'edit_tree', allowed: false},
                {name: 'edit_children', allowed: true}
            ]);
            expect(resGetTreePerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`{
                isAllowed(
                    type: tree_library,
                    actions: [
                        access_tree,
                        edit_tree,
                        edit_children,
                    ],
                    applyTo: "${permTreeName}/${treeLibId}"
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toEqual([
                {name: 'access_tree', allowed: true},
                {name: 'edit_tree', allowed: false},
                {name: 'edit_children', allowed: true}
            ]);
            expect(resIsAllowed.data.errors).toBeUndefined();
        });
    });

    describe('Herited permissions', () => {
        let userGroupId1;
        let userGroupId2;
        let userGroupId3;
        let userGroupId4;

        beforeAll(async () => {
            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") {id},
                r2: createRecord(library: "users_groups") {id},
                r3: createRecord(library: "users_groups") {id},
                r4: createRecord(library: "users_groups") {id}
            }`);

            userGroupId1 = resCreateGroups.data.data.r1.id;
            userGroupId2 = resCreateGroups.data.data.r2.id;
            userGroupId3 = resCreateGroups.data.data.r3.id;
            userGroupId4 = resCreateGroups.data.data.r4.id;

            // Add users groups to tree
            await makeGraphQlCall(`mutation {
                el1: treeAddElement(treeId: "users_groups", element: {id: "${userGroupId1}", library: "users_groups"}) {
                    id
                },
                el3: treeAddElement(treeId: "users_groups", element: {id: "${userGroupId3}", library: "users_groups"}) {
                    id
                },
            }`);

            await makeGraphQlCall(`mutation {
                el1: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId2}", library: "users_groups"},
                    parent: {id: "${userGroupId1}", library: "users_groups"}
                ) { id },
                el2: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId4}", library: "users_groups"},
                    parent: {id: "${userGroupId3}", library: "users_groups"}
                ) { id },
                el3: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId4}", library: "users_groups"},
                    parent: {id: "${userGroupId2}", library: "users_groups"}
                ) { id },
            }`);

            // User groups tree: [ROOT] -> group 1 -> group 2
            // We save a permission on group 1

            // Save perms
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_library,
                        applyTo: "${permTreeName}/${treeLibId}",
                        usersGroup: "${userGroupId1}",
                        actions: [
                            {name: access_tree, allowed: false},
                        ]
                    }
                ) { type }
            }`);

            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_library,
                        applyTo: "${permTreeName}/${treeLibId}",
                        usersGroup: "${userGroupId3}",
                        actions: [
                            {name: access_tree, allowed: true},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Retrieve permission herited from user group', async () => {
            // Get perm
            const permHeritGroup = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: tree_library,
                    applyTo: "${permTreeName}/${treeLibId}"
                    actions: [access_tree],
                    userGroupId: "${userGroupId2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_tree');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);

            // Get perm an test with one path to false and another to true
            const pHG = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: tree_library,
                    applyTo: "${permTreeName}/${treeLibId}"
                    actions: [access_tree],
                    userGroupId: "${userGroupId4}"
                ) { name allowed }
              }
            `);

            expect(pHG.status).toBe(200);
            expect(pHG.data.data.p[0].name).toBe('access_tree');
            expect(pHG.data.data.p[0].allowed).toBe(true);
        });
    });
});
