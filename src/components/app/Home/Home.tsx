import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import styled from 'styled-components';
import Attributes from '../../attributes/Attributes';
import EditAttribute from '../../attributes/EditAttribute';
import EditLibrary from '../../libraries/EditLibrary';
import Libraries from '../../libraries/Libraries';
import AdminPermissions from '../../permissions/AdminPermissions';
import EditTree from '../../trees/EditTree';
import Trees from '../../trees/Trees';
import MainMenu from '../MainMenu';

/* tslint:disable-next-line:variable-name */
const LeftCol = styled.div`
    position: fixed;
    width: 250px;
    background-color: #1b1c1d;
    min-height: 100vh;
`;

/* tslint:disable-next-line:variable-name */
const Content = styled.div`
    margin-left: 250px;
    padding: 20px;
    min-height: 100vh;
`;

function Home(): JSX.Element {
    return (
        <Router>
            <div className="wrapper height100">
                <LeftCol>
                    <MainMenu />
                </LeftCol>
                <Content className="content flex-col height100">
                    <Route path="/libraries" component={Libraries} exact />
                    <Route path="/libraries/edit/:id?" component={EditLibrary} exact />
                    <Route path="/attributes" component={Attributes} exact />
                    <Route path="/attributes/edit/:id?" component={EditAttribute} exact />
                    <Route path="/trees" component={Trees} exact />
                    <Route path="/trees/edit/:id?" component={EditTree} exact />
                    <Route path="/permissions" component={AdminPermissions} exact />
                </Content>
            </div>
        </Router>
    );
}

export default Home;
