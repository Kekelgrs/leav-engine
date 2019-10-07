import React, {useLayoutEffect, useEffect} from 'react';
import {shallow, mount, render} from 'enzyme';
import {act} from 'react-dom/test-utils';
// import ALCList from '../ALCList';

import {MockedProvider} from '@apollo/react-testing';

import ALCContainer from './ALCContainer';

// import {getActionListQuery} from '../../../../queries/attributes/getActionListQuery';

import {AVAILABLE_ACTIONS_MOCK, ATTRIBUTE_MOCK, NO_AVAILABLE_ACTION_MOCK} from '../mocks/ALCMocks';

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
// const canUseDOM: boolean = !!(
//     typeof window !== 'undefined' &&
//     typeof window.document !== 'undefined' &&
//     typeof window.document.createElement !== 'undefined'
//   );

// const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

const actionsMock = [
    {
        description: 'encryptValue',
        input_types: ['string'],
        name: 'encrypt',
        output_types: ['string'],
        params: null
    }
];

// function placeholder() {
//     return undefined;
// }

const wait = () => {
    return new Promise((res, rej) => {
        setTimeout(res, 200);
    });
};

jest.mock('../ALCList', () => {
    return function ALCList() {
        return <></>;
    };
});

describe('ALCContainer', () => {
    test('renders the reserve and the list', () => {
        const container = shallow(
            <MockedProvider mocks={AVAILABLE_ACTIONS_MOCK} addTypename={false}>
                <ALCContainer attribute={ATTRIBUTE_MOCK} availableActions={[]} inType={[]} outType={[]} />
            </MockedProvider>
        );
        expect(container.find('ALCReserve')).toHaveLength(0);
        expect(container.find('ALCList')).toHaveLength(0);
    });

    test('adds actions from config to list', async () => {
        let component;

        await act(async () => {
            component = mount(
                <MockedProvider mocks={AVAILABLE_ACTIONS_MOCK} addTypename={false}>
                    <ALCContainer
                        attribute={ATTRIBUTE_MOCK}
                        availableActions={actionsMock}
                        inType={['string']}
                        outType={['string']}
                    />
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait();
        });

        component.update();

        let addActionToList;

        act(() => {
            addActionToList = component.find('ALCList').prop('addActionToList');
        });

        act(() => {
            addActionToList('encrypt');
        });

        await act(async () => {
            await wait();
        });
        component.update();

        const actionList = component.find('ALCList').prop('actions');
        const actionListName = component.find('ALCList').prop('currentActionListName');

        expect(actionList[actionListName][actionList[actionListName].higherId].name).toBe('encrypt');

        component.unmount();
    });
});
