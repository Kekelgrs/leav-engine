// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getActiveTree, IGetActiveTree} from '../../queries/cache/activeTree/getActiveTreeQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {MockStateNavigation} from '../../__mocks__/Navigation/mockState';
import HeaderCellNavigation from './HeaderCellNavigation';

jest.mock(
    '../ActiveHeaderCellNavigation',
    () =>
        function ActiveHeaderCellNavigation() {
            return <div>ActiveHeaderCellNavigation</div>;
        }
);

describe('HeaderCellNavigation', () => {
    const path = [
        {id: 'parentId', label: 'parentLabel', library: 'parentLib'},
        {id: 'childId', label: 'childLabel', library: 'childLib'}
    ];

    test('should display parent Label', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateNavigation stateNavigation={{path}}>
                        <HeaderCellNavigation depth={1} />
                    </MockStateNavigation>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText(path[0].label)).toBeInTheDocument();
    });

    test('should display activeTreeLabel', async () => {
        const mockActiveTree: IGetActiveTree = {
            activeTree: {
                id: 'treeId',
                label: 'treeLabel',
                libraries: [{id: 'libId'}]
            }
        };

        const mockCache = new InMemoryCache();

        mockCache.writeQuery({
            query: getActiveTree,

            data: {
                ...mockActiveTree
            }
        });

        await act(async () => {
            render(
                <MockedProvider cache={mockCache}>
                    <MockStateNavigation stateNavigation={{path}}>
                        <HeaderCellNavigation depth={0} />
                    </MockStateNavigation>
                </MockedProvider>
            );
        });

        expect(await screen.findByText(mockActiveTree.activeTree?.label)).toBeInTheDocument();
    });

    test('should use ActiveHeaderCellNavigation', async () => {
        render(
            <MockedProviderWithFragments>
                <MockStateNavigation stateNavigation={{path}}>
                    <HeaderCellNavigation depth={1} isActive={true} />
                </MockStateNavigation>
            </MockedProviderWithFragments>
        );

        expect(await screen.findByText('ActiveHeaderCellNavigation')).toBeInTheDocument();
    });
});
