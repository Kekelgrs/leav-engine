// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IRecordAndChildren} from '../../../graphQL/queries/trees/getTreeContentQuery';
import {INavigationPath} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import ColumnFromPath from './ColumnFromPath';

jest.mock(
    '../../CellNavigation',
    () =>
        function CellNavigation() {
            return <div>CellNavigation</div>;
        }
);

describe('ColumnFromPath', () => {
    const mockTreeElements: IRecordAndChildren[] = [
        {
            record: {
                whoAmI: {
                    id: 'recordId',
                    label: 'recordLabel',
                    preview: null,
                    library: {
                        id: 'recordLibraryId',
                        label: {
                            fr: 'recordLibraryLabel',
                            en: 'recordLibraryLabel'
                        }
                    }
                }
            },
            children: [
                {
                    record: {
                        whoAmI: {
                            id: 'childRecordId',
                            label: 'childRecordLabel',
                            preview: null,
                            library: {
                                id: 'childRecordLibraryId',
                                label: {
                                    fr: 'childRecordLibraryLabel',
                                    en: 'childRecordLibraryLabel'
                                }
                            }
                        }
                    }
                },
                {
                    record: {
                        whoAmI: {
                            id: 'secondChildRecordId',
                            label: 'secondChildRecordLabel',
                            preview: null,
                            library: {
                                id: 'secondChildRecordLibraryId',
                                label: {
                                    fr: 'secondChildRecordLibraryLabel',
                                    en: 'secondChildRecordLibraryLabel'
                                }
                            }
                        }
                    }
                }
            ]
        }
    ];

    const mockPathPart: INavigationPath = {
        id: 'recordId',
        library: 'recordLibraryId'
    };

    test('should show loading', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ColumnFromPath
                        treeElements={mockTreeElements}
                        pathPart={mockPathPart}
                        depth={0}
                        showLoading
                        columnActive={false}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Spin')).toHaveLength(1);
    });

    test('should call CellNavigation for each child', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ColumnFromPath
                        treeElements={mockTreeElements}
                        pathPart={mockPathPart}
                        depth={0}
                        showLoading={false}
                        columnActive={false}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('CellNavigation')).toHaveLength(2);
    });
});
