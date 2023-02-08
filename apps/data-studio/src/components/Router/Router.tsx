// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Layout} from 'antd';
import Sidebar from 'components/Sidebar';
import TopBar from 'components/TopBar';
import {useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import NotifsPanel from '../NotifsPanel';
import UserPanel from '../UserPanel';
import Routes from './Routes';

const {Header, Content, Sider} = Layout;

function Router(): JSX.Element {
    const [userPanelVisible, setUserPanelVisible] = useState<boolean>(false);
    const [nbNotifs, setNbNotifs] = useState<number>(0);

    const toggleUserPanelVisible = () => setUserPanelVisible(visible => !visible);

    const hideUserPanel = () => setUserPanelVisible(false);

    const _setNbNotifs = (count: number) => setNbNotifs(count);

    return (
        <BrowserRouter basename={`${import.meta.env.VITE_ENDPOINT ?? '/'}`}>
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
                    <Header style={{height: themeVars.headerHeight, padding: 0}}>
                        <TopBar
                            userPanelVisible={userPanelVisible}
                            toggleUserPanelVisible={toggleUserPanelVisible}
                            nbNotifs={nbNotifs}
                        />
                    </Header>
                    <Layout style={{overflow: 'hidden', position: 'relative'}}>
                        <Content style={{background: themeVars.defaultBg, overflow: 'hidden'}}>
                            <UserPanel userPanelVisible={userPanelVisible} hideUserPanel={hideUserPanel} />
                            <NotifsPanel setNbNotifs={_setNbNotifs} />
                            <Routes />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </BrowserRouter>
    );
}

export default Router;
