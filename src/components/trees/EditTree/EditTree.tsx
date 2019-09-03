import {useMutation, useQuery} from '@apollo/react-hooks';
import {History} from 'history';
import React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {saveTreeQuery} from '../../../queries/trees/saveTreeMutation';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditTreeForm from '../EditTreeForm';

interface IEditTreeProps extends WithNamespaces {
    match: any;
    history: History;
}

function EditTree({match, history}: IEditTreeProps): JSX.Element {
    const treeId = match.params.id;
    const {lang} = useLang();
    const userData = useUserData();

    const {loading, error, data} = useQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
        variables: {id: treeId, lang}
    });
    const [saveTree] = useMutation(saveTreeQuery);

    const _getEditTreeForm = (treeToEdit: GET_TREES_trees_list | null) => {
        const readOnly = !userData.permissions[PermissionsActions.admin_edit_tree];

        const onFormSubmit = async treeData => {
            await saveTree({
                variables: {
                    treeData: {
                        id: treeData.id,
                        label: treeData.label,
                        libraries: treeData.libraries
                    }
                },
                refetchQueries: ['GET_TREES']
            });
            if (history) {
                history.replace({pathname: '/trees/edit/' + treeData.id});
            }
        };

        return <EditTreeForm tree={treeToEdit} onSubmit={onFormSubmit} readOnly={readOnly} />;
    };

    if (!treeId) {
        return _getEditTreeForm(null);
    }

    if (loading) {
        return <Loading withDimmer />;
    }

    if (typeof error !== 'undefined') {
        return <p>Error: {error.message}</p>;
    }

    if (!data || !data.trees || !data.trees.list.length) {
        return <div>Unknown tree</div>;
    }

    return _getEditTreeForm(data.trees.list[0]);
}
export default withNamespaces()(EditTree);
