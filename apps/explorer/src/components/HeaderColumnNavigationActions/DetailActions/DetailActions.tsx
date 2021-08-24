// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Dropdown, Menu} from 'antd';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import {removeTreeElementMutation} from 'graphQL/mutations/trees/removeTreeElementMutation';
import {getTreeContentQuery} from 'graphQL/queries/trees/getTreeContentQuery';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {resetNavigationRecordDetail, setNavigationPath, setNavigationRefetchTreeData} from 'redux/navigation';
import {addNotification} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {localizedTranslation} from 'utils';
import {REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables} from '_gqlTypes/REMOVE_TREE_ELEMENT';
import {INotification, NotificationChannel, NotificationType} from '_types/types';

interface IDetailActionsProps {
    isDetail: boolean;
    depth: number;
}

function DetailActions({isDetail, depth}: IDetailActionsProps): JSX.Element {
    const navigation = useAppSelector(state => state.navigation);
    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    const [{lang}] = useLang();
    const [activeTree] = useActiveTree();

    const [removeFromTree] = useMutation<REMOVE_TREE_ELEMENT, REMOVE_TREE_ELEMENTVariables>(removeTreeElementMutation, {
        refetchQueries: [{query: getTreeContentQuery(depth), variables: {treeId: activeTree?.id}}]
    });

    const handleDeleteCurrentElement = async () => {
        const element = {
            id: navigation.recordDetail.whoAmI.id,
            library: navigation.recordDetail.whoAmI.library.id
        };

        const label = localizedTranslation(navigation.recordDetail.whoAmI.label, lang);

        try {
            await removeFromTree({
                variables: {
                    treeId: activeTree.id,
                    element
                }
            });

            const notification: INotification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.success,
                content: t('navigation.notifications.success-detach', {
                    elementName: element.id
                })
            };
            dispatch(addNotification(notification));

            closeDetail();
        } catch (e) {
            const notification: INotification = {
                channel: NotificationChannel.trigger,
                type: NotificationType.error,
                content: t('navigation.notifications.error-detach', {
                    elementName: label ?? element.id,
                    errorMessage: e.message
                })
            };

            dispatch(addNotification(notification));
        }

        dispatch(setNavigationRefetchTreeData(true));
    };

    const closeDetail = () => {
        dispatch(resetNavigationRecordDetail());
        dispatch(setNavigationPath(navigation.path.slice(0, -1)));
    };

    if (isDetail) {
        return (
            <>
                <span data-testid="dropdown-detail-actions">
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item onClick={handleDeleteCurrentElement}>
                                    {t('navigation.actions.detach-element')}
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <StandardBtn icon={<IconEllipsisVertical />} />
                    </Dropdown>
                </span>
                <StandardBtn role="button" icon={<CloseOutlined />} onClick={closeDetail} />
            </>
        );
    }
    return <></>;
}

export default DetailActions;
