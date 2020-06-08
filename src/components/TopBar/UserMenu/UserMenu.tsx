import {useQuery} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dropdown, Menu} from 'semantic-ui-react';
import {getUser} from '../../../queries/cache/user/userQuery';

function UserMenu(): JSX.Element {
    const {t} = useTranslation();

    const {data: dataUser} = useQuery(getUser);
    const userName = dataUser?.userName ?? dataUser?.userId ?? '';

    const iconContent = userName.split(' ').map(word => word[0]);

    const nameIconStyle = {
        borderRadius: '50%',
        background: 'hsl(130, 52%, 58%)',
        color: '#FFFFFF',
        height: '2rem',
        width: '2rem',
        display: 'flex',
        flexDirection: 'column' as 'column',
        justifyContent: 'center',
        textAlign: 'center' as 'center',
        fontWeight: 'bold' as 'bold',
        fontSize: '.8rem'
    };

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center'
            }}
        >
            <div style={nameIconStyle}>{iconContent}</div>
            <Dropdown item as={Menu.Item} direction="left" text={userName}>
                <Dropdown.Menu>
                    <Dropdown.Item text={t('menu.user_menu.profil')} />
                    <Dropdown.Item text={t('menu.user_menu.tasks')} />
                    <Dropdown.Item text={t('menu.user_menu.shortcuts')} />
                    <Dropdown.Item text={t('menu.user_menu.events')} />
                    <Dropdown.Item text={t('menu.user_menu.admin')} />
                    <Dropdown.Divider />
                    <Dropdown.Header>{t('menu.user_menu.leav_engine')} </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item icon="log out" text={t('menu.user_menu.logout')} />
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export default UserMenu;
