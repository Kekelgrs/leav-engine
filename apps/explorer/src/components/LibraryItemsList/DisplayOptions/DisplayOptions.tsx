// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, DownOutlined, MenuOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import {DisplayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

const ListSmallIcon = styled(MenuOutlined)`
    transform: scale(0.7);
`;

const ListBigIcon = styled(MenuOutlined)`
    transform: scale(1.3);
`;

const CustomButton = styled(Button)`
    padding: 0.3rem;
`;

function DisplayOptions(): JSX.Element {
    const {t} = useTranslation();

    const displayOptions = [
        {
            key: 'list-small',
            text: t('items_list.display.list-small'),
            value: DisplayListItemTypes.listSmall,
            icon: <ListSmallIcon />
        },
        {
            key: 'list-medium',
            text: t('items_list.display.list-medium'),
            value: DisplayListItemTypes.listMedium,
            icon: <MenuOutlined />
        },
        {
            key: 'list-big',
            text: t('items_list.display.list-big'),
            value: DisplayListItemTypes.listBig,
            icon: <ListBigIcon />
        },
        {
            key: 'tile',
            text: t('items_list.display.tile'),
            value: DisplayListItemTypes.tile,
            icon: <AppstoreFilled />
        }
    ];

    const {stateItems, dispatchItems} = useStateItem();

    const [currentDisplayOption, setCurrentDisplayOption] = useState(
        displayOptions.find(displayOption => displayOption.value === stateItems.displayType)
    );

    const changeDisplay = (value: string) => {
        const newDisplay = value?.toString();

        if (newDisplay) {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE,
                displayType: DisplayListItemTypes[newDisplay]
            });
        }

        const newCurrentDisplayOption = displayOptions.find(displayOption => displayOption.value === newDisplay);
        setCurrentDisplayOption(newCurrentDisplayOption);
    };

    return (
        <Dropdown
            overlay={
                <Menu>
                    {displayOptions.map(displayOption => (
                        <Menu.Item key={displayOption.key} onClick={() => changeDisplay(displayOption.value)}>
                            <span>{displayOption.icon}</span>
                            {displayOption.text}
                        </Menu.Item>
                    ))}
                </Menu>
            }
        >
            <CustomButton title={currentDisplayOption?.text}>
                {currentDisplayOption?.icon}
                <DownOutlined />
            </CustomButton>
        </Dropdown>
    );
}

export default DisplayOptions;
