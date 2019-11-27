import {useQuery} from '@apollo/react-hooks';
import {History} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {addWildcardToFilters} from '../../../utils/utils';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import LibrariesList from '../LibrariesList';

interface ILibrariesProps {
    history: History;
}

/* tslint:disable-next-line:variable-name */
const Libraries = ({history}: ILibrariesProps): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const userData = useUserData();
    const [filters, setFilters] = useState<any>({});
    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {...addWildcardToFilters(filters), lang}
    });

    const _onFiltersUpdate = (filterElem: any) => {
        const newElemState =
            filterElem.type === 'checkbox'
                ? filterElem.indeterminate
                    ? undefined
                    : filterElem.checked
                : filterElem.value;

        setFilters({
            ...filters,
            [filterElem.name]: newElemState
        });
    };
    const onRowClick = library => history.push('/libraries/edit/' + library.id);

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        {t('libraries.title')}
                    </Header>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_library] && (
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/libraries/edit'}>
                            <Icon name="plus" />
                            {t('libraries.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {typeof error !== 'undefined' ? (
                <p>Error: {error.message}</p>
            ) : (
                <LibrariesList
                    loading={loading || !data}
                    libraries={data && data.libraries ? data.libraries.list : []}
                    onRowClick={onRowClick}
                    onFiltersUpdate={_onFiltersUpdate}
                    filters={filters}
                />
            )}
        </>
    );
};

export default Libraries;
