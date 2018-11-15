import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Icon, Menu} from 'semantic-ui-react';

export interface IAppMenuItem {
    id: string;
    label: string;
}

export interface IAppMenuProps extends WithNamespaces {
    items: IAppMenuItem[];
}

function AppMenu({items, t}: IAppMenuProps): JSX.Element {
    return (
        <Menu vertical fluid inverted>
            <Menu.Item header position="left">
                <Icon name="cogs" />
                <strong>{t('admin.title')}</strong>
            </Menu.Item>
            <Menu.Menu>
                {items.map((item: IAppMenuItem) => (
                    <Menu.Item className="menu_item" key={item.id} as={NavLink} to={'/' + item.id} name={item.id}>
                        <Icon name="angle right" />
                        {item.label}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        </Menu>
    );
}

export default withNamespaces()(AppMenu);
