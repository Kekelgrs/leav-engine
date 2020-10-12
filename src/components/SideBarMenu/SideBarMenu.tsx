import {
    BookOutlined,
    DatabaseOutlined,
    FolderOutlined,
    SettingOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Drawer, Menu} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink, useLocation} from 'react-router-dom';
import {getActiveLibrary, IGetActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {localizedLabel} from '../../utils';
import {ILibrary} from '../../_types/types';

interface ISideBarMenuProps {
    visible: boolean;
    hide: () => void;
}

function SideBarMenu({visible, hide}: ISideBarMenuProps): JSX.Element {
    const {t} = useTranslation();
    const location = useLocation();

    const activeKeys = location.pathname.split('/');

    const {data: dataLib} = useQuery<IGetActiveLibrary>(getActiveLibrary);
    const activeLib = dataLib?.activeLib;

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const [libraries, setLibraries] = useState<ILibrary[]>([]);

    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data?.libraries?.list ?? []);
        }
    }, [loading, data, error]);

    if (error) {
        return <div>error</div>;
    }

    const checkActive = (match: any, location: any) => {
        //some additional logic to verify you are in the home URI
        if (!location) return false;
        const {pathname} = location;
        return pathname === '/';
    };

    return (
        <Drawer
            visible={visible}
            onClose={hide}
            placement="left"
            closable={false}
            getContainer={false}
            style={{position: 'absolute'}}
            bodyStyle={{padding: 0}}
        >
            <Menu
                theme="dark"
                style={{height: '100%'}}
                mode="inline"
                selectedKeys={activeKeys}
                defaultOpenKeys={['libraries', 'shortcuts']}
            >
                <Menu.SubMenu key="shortcuts" icon={<UnorderedListOutlined />} title={t('sidebar.shortcuts')}>
                    {activeLib?.id && (
                        <Menu.Item key={activeLib.id} icon={<DatabaseOutlined />}>
                            <NavLink
                                to={`/library/items/${activeLib.id}/${activeLib.gql.query}/${activeLib.filter}`}
                                onClick={hide}
                                strict
                                activeClassName="nav-link-active"
                                isActive={checkActive}
                            >
                                {activeLib.name}
                            </NavLink>
                        </Menu.Item>
                    )}

                    <Menu.Item key="list" icon={<BookOutlined />} onClick={hide}>
                        <NavLink to="/library/list/" activeClassName="nav-link-active">
                            {t('sidebar.lib_list')}
                        </NavLink>
                    </Menu.Item>

                    <Menu.Item key="navigation" icon={<FolderOutlined />} onClick={hide}>
                        <NavLink to="/navigation" activeClassName="nav-link-active">
                            {t('sidebar.navigation')}
                        </NavLink>
                    </Menu.Item>

                    <Menu.Item key="setting" icon={<SettingOutlined />} onClick={hide}>
                        <NavLink to="/setting" activeClassName="nav-link-active">
                            {t('sidebar.setting')}
                        </NavLink>
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu key="libraries" icon={<DatabaseOutlined />} title={t('sidebar.libraries')}>
                    {libraries.map(lib => (
                        <Menu.Item key={lib.id}>
                            <NavLink
                                key={lib.id}
                                to={`/library/items/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`}
                                onClick={hide}
                                activeClassName="nav-link-active"
                            >
                                {localizedLabel(lib.label, lang)}
                            </NavLink>
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>
            </Menu>
        </Drawer>
    );
}

export default SideBarMenu;
