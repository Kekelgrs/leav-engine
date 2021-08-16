// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Input, Tooltip} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';

interface IDeleteSearchCross {
    style?: CSSObject;
    search: string;
}

const DeleteSearchCross = styled.div<IDeleteSearchCross>`
    opacity: ${props => (props.search ? 1 : 0)};
`;

function SearchItems(): JSX.Element {
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [search, setSearch] = useState<string>('');

    const {t} = useTranslation();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        searchDispatch({type: SearchActionTypes.SET_FULLTEXT, fullText: event.target.value});
    };

    const handleEnter = e => {
        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true});
    };

    const resetSearch = () => {
        setSearch('');
    };

    return (
        <div>
            <Input
                placeholder={t('search.placeholder')}
                value={searchState.fullText}
                onChange={handleChange}
                onPressEnter={handleEnter}
                suffix={
                    <DeleteSearchCross search={search}>
                        <Tooltip placement="bottom" title={t('search.explain-cancel')}>
                            <CloseOutlined onClick={resetSearch} />
                        </Tooltip>
                    </DeleteSearchCross>
                }
            />
        </div>
    );
}

export default SearchItems;
