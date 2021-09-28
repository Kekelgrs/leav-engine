// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Layout} from 'antd';
import Sidebar from 'components/Sidebar';
import TopBar from 'components/TopBar';
import React, {useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import themingVar from 'themingVar';
import UserPanel from '../UserPanel';
import Routes from './Routes';

const {Header, Content, Sider} = Layout;

function Router(): JSX.Element {
    const [userPanelVisible, setUserPanelVisible] = useState<boolean>(false);

    const toggleUserPanelVisible = () => {
        setUserPanelVisible(visible => !visible);
    };

    const hideUserPanel = () => setUserPanelVisible(false);

    return (
        <>
            <BrowserRouter>
                <Layout style={{height: '100vh'}}>
                    <Sider
                        theme="light"
                        collapsible
                        defaultCollapsed
                        collapsedWidth={60}
                        width={250}
                        style={{borderRight: '1px solid #DDD'}}
                    >
                        <Sidebar />
                    </Sider>
                    <Layout>
                        <Header style={{height: themingVar['@leav-header-height'], padding: 0}}>
                            <TopBar
                                userPanelVisible={userPanelVisible}
                                toggleUserPanelVisible={toggleUserPanelVisible}
                            />
                        </Header>
                        <Layout style={{overflow: 'hidden', position: 'relative'}}>
                            <Content
                                style={{background: themingVar['@default-bg'], padding: '0 .5em', overflow: 'hidden'}}
                            >
                                <UserPanel userPanelVisible={userPanelVisible} hideUserPanel={hideUserPanel} />
                                <Routes />
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </BrowserRouter>
        </>
    );
}

export default Router;
