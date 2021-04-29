// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import NavigationHeader from 'components/NavigationHeader';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {getTreeListQuery} from '../../graphQL/queries/trees/getTreeListQuery';
import {useActiveTree} from '../../hooks/ActiveTreeHook/ActiveTreeHook';
import {useLang} from '../../hooks/LangHook/LangHook';
import {useNotifications} from '../../hooks/NotificationsHook/NotificationsHook';
import {localizedLabel} from '../../utils';
import {GET_TREE_LIST_QUERY, GET_TREE_LIST_QUERYVariables} from '../../_gqlTypes/GET_TREE_LIST_QUERY';
import {NotificationType} from '../../_types/types';
import NavigationView from '../NavigationView';

interface INavigationParams {
    treeId: string;
}

function Navigation(): JSX.Element {
    const {t} = useTranslation();
    const {treeId} = useParams<INavigationParams>();

    const [{lang}] = useLang();
    const [, updateActiveTree] = useActiveTree();
    const {updateBaseNotification} = useNotifications();

    const {data, loading} = useQuery<GET_TREE_LIST_QUERY, GET_TREE_LIST_QUERYVariables>(getTreeListQuery, {
        variables: {treeId}
    });

    useEffect(() => {
        const currentTree = data?.trees?.list[0];
        if (!loading && currentTree) {
            const treeName = localizedLabel(currentTree.label, lang);
            // set Active Tree Data
            updateActiveTree({
                id: currentTree.id,
                label: treeName,
                libraries: currentTree.libraries.map(lib => ({id: lib.library.id}))
            });

            updateBaseNotification({
                content: t('notification.active-tree', {tree: treeName}),
                type: NotificationType.basic
            });
        }
    }, [data, loading, lang, updateActiveTree, t, updateBaseNotification]);

    return (
        <>
            <NavigationHeader />
            <NavigationView />
        </>
    );
}

export default Navigation;
