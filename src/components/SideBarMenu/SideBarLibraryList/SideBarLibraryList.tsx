import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {NavLink} from 'react-router-dom';
import {Icon, Menu} from 'semantic-ui-react';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {getLibrariesListQuery} from '../../../queries/libraries/getLibrariesListQuery';
import {localizedLabel} from '../../../utils';
import {ILibrary} from '../../../_types/types';

interface ISideBarLibraryListProps {
    hide: () => void;
}

function SideBarLibraryList({hide}: ISideBarLibraryListProps): JSX.Element {
    const [libraries, setLibraries] = useState<ILibrary[]>([]);

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

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
        <>
            {libraries.map(lib => (
                <NavLink
                    key={lib.id}
                    to={`/library/items/${lib.id}/${lib.gqlNames.query}`}
                    onClick={hide}
                    activeClassName="nav-link-active"
                >
                    <Menu.Item as="span">
                        <Icon name="database" />
                        {localizedLabel(lib.label, lang)}
                    </Menu.Item>
                </NavLink>
            ))}
        </>
    );
}

export default SideBarLibraryList;
