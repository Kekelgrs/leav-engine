// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen, waitForElement} from '_tests/testUtils';
import {getTreeContentQuery} from '../../../graphQL/queries/trees/getTreeContentQuery';
import SelectTreeNode from './SelectTreeNode';

describe('SelectTreeNode', () => {
    test('Should render', async () => {
        const mocks = [
            {
                request: {
                    query: getTreeContentQuery(100),
                    variables: {
                        treeId: 'treeId'
                    }
                },
                result: {
                    data: {
                        treeContent: [
                            {
                                record: {
                                    id: 'id1',
                                    whoAmI: {
                                        id: 'id1',
                                        label: 'label1',
                                        color: null,
                                        library: {
                                            id: 'categories',
                                            label: {fr: 'Catégories'},
                                            gqlNames: {
                                                type: 'Categorie',
                                                query: 'categories',
                                                __typename: 'LibraryGraphqlNames'
                                            },
                                            __typename: 'Library'
                                        },
                                        preview: null,
                                        __typename: 'RecordIdentity'
                                    },
                                    __typename: 'Categorie'
                                },
                                children: [
                                    {
                                        record: {
                                            id: 'id2',
                                            whoAmI: {
                                                __typename: 'RecordIdentity',
                                                id: 'id2',
                                                label: 'label2',
                                                color: null,
                                                library: {
                                                    id: 'categories',
                                                    label: {fr: 'Catégories'},
                                                    gqlNames: {
                                                        type: 'Categorie',
                                                        query: 'categories',
                                                        __typename: 'LibraryGraphqlNames'
                                                    },
                                                    __typename: 'Library'
                                                },
                                                preview: null
                                            },
                                            __typename: 'Categorie'
                                        },
                                        children: [],
                                        __typename: 'TreeNode'
                                    }
                                ],
                                __typename: 'TreeNode'
                            }
                        ]
                    }
                }
            }
        ];

        await act(async () => {
            render(<SelectTreeNode tree={{id: 'treeId', label: {fr: 'tree'}}} onSelect={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings: {
                    possibleTypes: {
                        Record: ['Categorie']
                    }
                }
            });
        });

        await waitForElement(() => screen.getByText('tree'));
        expect(screen.getByText('tree')).toBeInTheDocument();
    });
});
