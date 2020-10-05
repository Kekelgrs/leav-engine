import {mount} from 'enzyme';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import UserContext from '../UserContext';
import {IUserContext} from '../UserContext/UserContext';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
    const TestComp = () => <div>Test</div>;
    const defaultContext: IUserContext = {
        id: 1,
        name: 'Test User',
        permissions: {
            [PermissionsActions.app_access_attributes]: true,
            [PermissionsActions.app_edit_attribute]: true
        }
    };

    test('Render normally if no permissions specified', async () => {
        const comp = mount(
            <UserContext.Provider value={defaultContext}>
                <Router>
                    <ProtectedRoute path="/" component={TestComp} />
                </Router>
            </UserContext.Provider>
        );

        expect(comp.find('TestComp')).toHaveLength(1);
    });

    test('Render normally if permission granted', async () => {
        const comp = mount(
            <UserContext.Provider value={defaultContext}>
                <Router>
                    <ProtectedRoute
                        permissions={[PermissionsActions.app_access_attributes]}
                        path="/"
                        component={TestComp}
                    />{' '}
                </Router>
            </UserContext.Provider>
        );
        expect(comp.find('TestComp')).toHaveLength(1);
    });

    test('Render forbidden if not allowed', async () => {
        const comp = mount(
            <UserContext.Provider
                value={{...defaultContext, permissions: {[PermissionsActions.app_access_attributes]: false}}}
            >
                <Router>
                    <ProtectedRoute
                        permissions={[PermissionsActions.app_access_attributes]}
                        path="/"
                        component={TestComp}
                    />{' '}
                </Router>
            </UserContext.Provider>
        );
        expect(comp.find('TestComp')).toHaveLength(0);
    });

    test('Works with multiple permissions', async () => {
        const comp = mount(
            <UserContext.Provider
                value={{
                    ...defaultContext,
                    permissions: {
                        [PermissionsActions.app_access_attributes]: false,
                        [PermissionsActions.app_edit_attribute]: true
                    }
                }}
            >
                <Router>
                    <ProtectedRoute
                        permissions={[PermissionsActions.app_access_attributes, PermissionsActions.app_edit_attribute]}
                        path="/"
                        component={TestComp}
                    />{' '}
                </Router>
            </UserContext.Provider>
        );
        expect(comp.find('TestComp')).toHaveLength(0);
    });
});
