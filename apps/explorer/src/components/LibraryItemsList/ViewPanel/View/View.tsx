// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EllipsisOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu, Typography} from 'antd';
import useAddViewMutation from 'graphQL/mutations/views/hooks/useAddViewMutation';
import useDeleteViewMutation from 'graphQL/mutations/views/hooks/useDeleteViewMutation';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import _ from 'lodash';
import React, {useState} from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {defaultView} from '../../../../constants/constants';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import themingVar from '../../../../themingVar';
import {localizedTranslation} from '../../../../utils';
import {IView} from '../../../../_types/types';
import IconViewType from '../../../IconViewType';
import {getRequestFromFilters} from '../../FiltersPanel/getRequestFromFilter';

interface IWrapperProps {
    selected: boolean;
}

const Infos = styled.div`
    width: 100%;
`;

const Wrapper = styled.div<IWrapperProps>`
    background: ${({selected}) => (selected ? `${themingVar['@leav-background-active']} ` : 'none')};
    padding: 0.5rem;
    display: flex;
    align-items: center;
`;

const Handle = styled.div`
    content: '....';
    width: 20px;
    height: 30px;
    display: inline-block;
    line-height: 5px;
    padding: 3px 4px;
    vertical-align: middle;
    font-size: 12px;
    font-family: sans-serif;
    letter-spacing: 2px;
    color: ${themingVar['@divider-color']};
    text-shadow: 1px 0 1px black;

    &::after {
        content: '.. .. .. ..';
    }
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
`;

const Description = styled.div`
    opacity: 0.8;
    margin-left: 10px;
    overflow: hidden;
`;

const CustomButton = styled(Button)`
    background-color: ${themingVar['@default-bg']};
    transform: scale(0.8);
    &:hover {
        background-color: ${themingVar['@default-bg']};
    }
`;

interface IViewProps {
    view: IView;
    onEdit: (viewId: string) => void;
    handleProps?: DraggableProvidedDragHandleProps;
}

function View({view, onEdit, handleProps}: IViewProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang, defaultLang}] = useLang();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [description, setDescription] = useState<{expand: boolean; key: number}>({expand: false, key: 0});

    const {addView} = useAddViewMutation(searchState.library.id);

    // const [deleteView] = useMutation<IDeleteViewMutation, IDeleteViewMutationVariables>(deleteViewMutation);
    const {deleteView} = useDeleteViewMutation();

    const _changeView = () => {
        searchDispatch({type: SearchActionTypes.CHANGE_VIEW, view});
    };

    const ROWS_DESCRIPTION = 3;

    const _handleDelete = async (event: any) => {
        // cancel click view selection
        event.domEvent.stopPropagation();

        await deleteView(view.id);

        // set flag to refetch views
        if (view.id === searchState.view.current.id) {
            searchDispatch({type: SearchActionTypes.CHANGE_VIEW, view: defaultView});
        }

        searchDispatch(
            !view.shared
                ? {
                      type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                      userViewsOrder: searchState.userViewsOrder.filter(id => id !== view.id)
                  }
                : {
                      type: SearchActionTypes.SET_SHARED_VIEWS_ORDER,
                      sharedViewsOrder: searchState.sharedViewsOrder.filter(id => id !== view.id)
                  }
        );
    };

    const _handleDuplicate = async (event: any) => {
        // cancel click view selection
        event.domEvent.stopPropagation();

        try {
            const newViewRes = await addView({
                view: {
                    ..._.omit(view, 'owner'),
                    label: {
                        [defaultLang]: `${localizedTranslation(view.label, lang)} (${t('global.copy')})`
                    },
                    filters: getRequestFromFilters(view.filters),
                    id: undefined,
                    library: searchState.library.id,
                    shared: false
                }
            });

            // set flag to refetch views
            searchDispatch({
                type: SearchActionTypes.SET_VIEW_RELOAD,
                reload: true
            });

            searchDispatch({
                type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                userViewsOrder: [...searchState.userViewsOrder, newViewRes.data.saveView.id]
            });
        } catch (e) {
            console.error(e);
        }
    };

    const _handleEdit = (event: any) => {
        // cancel click view selection
        event.domEvent.stopPropagation();

        onEdit(view.id);
    };

    const _onExpand = () => {
        setDescription({expand: true, key: description.key});
    };

    const _onClose = () => {
        setDescription({expand: false, key: description.key + 1});
    };

    const selected = view.id === searchState.view.current?.id;

    const viewLabel = localizedTranslation(view.label, lang);
    return (
        <Wrapper key={view.id} selected={selected} onClick={_changeView} color={view.color}>
            <Handle className="view-handle" {...handleProps} />
            <Infos>
                <Title data-testid="view-title">
                    <IconViewType type={view.display.type} />
                    <Typography.Text ellipsis={{tooltip: true}} style={{padding: '0 .5em', width: 'calc(100% - 1em)'}}>
                        {viewLabel}
                    </Typography.Text>
                </Title>
                {view.description && (
                    <Description>
                        <Typography.Paragraph
                            key={description.key}
                            ellipsis={{
                                rows: ROWS_DESCRIPTION,
                                expandable: true,
                                onExpand: _onExpand,
                                symbol: t('view.see-more')
                            }}
                            style={{marginBottom: 0}}
                        >
                            {localizedTranslation(view.description, lang)}
                        </Typography.Paragraph>
                        {description.expand && (
                            <a
                                href="!#"
                                onClick={ev => {
                                    ev.preventDefault();
                                    _onClose();
                                }}
                            >
                                {t('global.close')}
                            </a>
                        )}
                    </Description>
                )}
            </Infos>

            <Dropdown
                overlay={
                    <Menu
                        items={[
                            {key: 'edit', disabled: !view.owner, onClick: _handleEdit, label: t('global.edit')},
                            {key: 'duplicate', onClick: _handleDuplicate, label: t('global.duplicate')},
                            {key: 'delete', disabled: !view.owner, onClick: _handleDelete, label: t('view.delete')}
                        ]}
                    ></Menu>
                }
            >
                <CustomButton onClick={e => e.stopPropagation()} icon={<EllipsisOutlined />} />
            </Dropdown>
        </Wrapper>
    );
}

export default View;
