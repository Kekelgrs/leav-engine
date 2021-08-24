// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {setSearchSelection, setSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {localizedTranslation} from 'utils';
import {SharedStateSelectionType} from '_types/types';

function MenuSelection(): JSX.Element {
    const {t} = useTranslation();

    const selectionMode = useContext(SelectionModeContext);

    const {state: searchState} = useSearchReducer();
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));
    const dispatch = useAppDispatch();
    const [{lang}] = useLang();

    const offsetDisplay = searchState.totalCount > 0 ? searchState.offset + 1 : 0;
    const nextOffsetDisplay =
        searchState.offset + searchState.pagination > searchState.totalCount
            ? searchState.totalCount
            : searchState.offset + searchState.pagination;

    const selectAll = () => {
        if (!selectionMode) {
            dispatch(
                setSelection({
                    type: SharedStateSelectionType.search,
                    selected: [],
                    allSelected: true
                })
            );
        }
    };

    const selectVisible = () => {
        let selected = [...selectionState.selection.selected];

        if (searchState.records) {
            for (const record of searchState.records) {
                selected = [
                    ...selected,
                    {
                        id: record.whoAmI.id,
                        library: record.whoAmI.library.id,
                        label: localizedTranslation(record.whoAmI.label, lang)
                    }
                ];
            }
        }

        if (selectionMode) {
            dispatch(
                setSearchSelection({
                    type: SharedStateSelectionType.search,
                    selected,
                    allSelected: false
                })
            );
        } else {
            dispatch(
                setSelection({
                    type: SharedStateSelectionType.search,
                    selected,
                    allSelected: false
                })
            );
        }
    };

    return (
        <span data-testid="dropdown-menu-selection">
            <Dropdown
                overlay={
                    <Menu>
                        {!selectionMode && (
                            <Menu.Item onClick={selectAll}>
                                {t('items-menu-dropdown.select-all', {nb: searchState.totalCount})}
                            </Menu.Item>
                        )}
                        <Menu.Item onClick={selectVisible}>
                            {t('items-menu-dropdown.select-visible', {nb: searchState.records.length})}
                        </Menu.Item>
                    </Menu>
                }
            >
                <span>
                    {t('items-list-row.nb-elements', {
                        nb1: offsetDisplay,
                        nb2: nextOffsetDisplay,
                        nbItems: searchState.totalCount
                    })}
                    <DownOutlined style={{paddingLeft: 6}} />
                </span>
            </Dropdown>
        </span>
    );
}

export default MenuSelection;
