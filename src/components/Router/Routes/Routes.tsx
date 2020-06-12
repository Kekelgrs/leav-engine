import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Home from '../../Home';
import LibrariesList from '../../LibrariesList';
import LibraryItemsList from '../../LibraryItemsList';
import Setting from '../../Setting';
import RouteNotFound from '../RouteNotFound';

function Routes(): JSX.Element {
    return (
        <Switch>
            <Route exact path="/">
                <LibrariesList />
            </Route>

            <Route path="/home">
                <Home />
            </Route>

            <Route exact path="/library/list/">
                <LibrariesList />
            </Route>

            <Route exact path="/library/list/:libId/:libQueryName">
                <LibrariesList />
            </Route>

            <Route exact path="/library/items/:libId/:libQueryName/:filterName">
                <LibraryItemsList />
            </Route>

            <Route path="/setting">
                <Setting />
            </Route>

            <Route>
                <RouteNotFound />
            </Route>
        </Switch>
    );
}

export default Routes;
