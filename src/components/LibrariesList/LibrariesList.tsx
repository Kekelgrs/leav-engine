import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {Card, Divider, Header} from 'semantic-ui-react';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import {ILibrary} from '../../_types/types';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

function LibrariesList(): JSX.Element {
    const {t} = useTranslation();
    const [libraries, setLibraries] = useState<ILibrary[]>([]);

    const {libId, libQueryName, filterName} = useParams();

    const {loading, data, error} = useQuery(getLibrariesListQuery);

    useEffect(() => {
        if (!loading) {
            setLibraries(data?.libraries?.list ?? []);
        }
    }, [loading, data, error]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <div className="wrapper-page">
            <Header as="h2">{t('lib_list.header')}</Header>
            <Card.Group itemsPerRow={4}>
                {libraries.map(lib => (
                    <LibraryCard key={lib.id} lib={lib} />
                ))}
            </Card.Group>

            {libId && libQueryName && (
                <>
                    <Divider />
                    <LibraryDetail libId={libId} libQueryName={libQueryName} filterName={filterName} />
                </>
            )}
        </div>
    );
}

export default LibrariesList;
