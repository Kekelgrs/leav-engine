import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {MemoryRouter} from 'react-router-dom';
import {getLibrariesListQuery} from '../../../queries/libraries/getLibrariesListQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibrariesList from '../../LibrariesList';
import RouteNotFound from '../RouteNotFound';
import Routes from './Routes';

jest.mock(
    '../../Home',
    () =>
        function Home() {
            return <div>Home</div>;
        }
);

jest.mock(
    '../../LibrariesList',
    () =>
        function LibrariesList() {
            return <div>LibrariesList</div>;
        }
);
jest.mock(
    '../../LibraryItemsList',
    () =>
        function LibraryItemsList() {
            return <div>LibraryItemsList</div>;
        }
);
jest.mock(
    '../../Setting',
    () =>
        function Setting() {
            return <div>Setting</div>;
        }
);
jest.mock(
    '../RouteNotFound',
    () =>
        function RouteNotFound() {
            return <div>RouteNotFound</div>;
        }
);

describe('Routes', () => {
    const mock = [
        {
            request: {
                query: getLibrariesListQuery
            },
            result: {
                data: {
                    libraries: {
                        list: {
                            id: 'test',
                            label: 'testName',
                            gqlNames: {
                                query: 'testQueryName',
                                __typename: 'gqlNames'
                            },
                            __typename: 'libraries'
                        },
                        __typename: 'list'
                    }
                }
            }
        }
    ];

    test('404 call notFound', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MemoryRouter initialEntries={['/fakeUrl']}>
                        <Routes />
                    </MemoryRouter>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(RouteNotFound)).toHaveLength(1);
    });

    test('default url call LibrariesList', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MemoryRouter initialEntries={['/']}>
                        <Routes />
                    </MemoryRouter>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(LibrariesList)).toHaveLength(1);
    });
});
