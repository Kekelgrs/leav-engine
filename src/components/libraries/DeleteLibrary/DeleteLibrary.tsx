import {DataProxy} from 'apollo-cache';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {DeleteLibMutation, deleteLibQuery} from '../../../queries/libraries/deleteLibMutation';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteLibraryProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries;
}

function DeleteLibrary({library, t}: IDeleteLibraryProps): JSX.Element {
    const _updateCache = (cache: DataProxy, {data: {deleteLibrary}}: any) => {
        const cacheData: any = cache.readQuery({query: getLibsQuery});
        cache.writeQuery({
            query: getLibsQuery,
            data: {libraries: cacheData.libraries.filter(l => l.id !== deleteLibrary.id)}
        });
    };

    return (
        <DeleteLibMutation mutation={deleteLibQuery} update={_updateCache}>
            {deleteLib => {
                const onDelete = async () =>
                    deleteLib({
                        variables: {libID: library.id}
                    });

                const libLabel =
                    library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

                return (
                    <ConfirmedButton action={onDelete} confirmMessage={t('libraries.confirm_delete', {libLabel})}>
                        <DeleteButton disabled={!!library.system} />
                    </ConfirmedButton>
                );
            }}
        </DeleteLibMutation>
    );
}

export default withNamespaces()(DeleteLibrary);
