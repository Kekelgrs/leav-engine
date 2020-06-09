import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Button, Container, List} from 'semantic-ui-react';
import styled from 'styled-components';
import {getLibraryDetailQuery} from '../../../../queries/libraries/getLibraryDetailQuery';
import {IFilters, operatorFilter, whereFilter} from '../../../../_types/types';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface IAttributeListProps {
    libId: string;
    libQueryName: string;
    setFilters: React.Dispatch<React.SetStateAction<IFilters[]>>;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
}

function AttributeList({libId, libQueryName, setFilters, setShowAttr}: IAttributeListProps): JSX.Element {
    const [attributes, setAttrs] = useState<any>([]);

    const {loading, data, error} = useQuery(getLibraryDetailQuery(libQueryName), {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loading) {
            const attributes = data?.libraries?.list[0]?.attributes;
            setAttrs(attributes);
        }
    }, [loading, data, error]);
    return (
        <Container>
            <List divided>
                {attributes &&
                    attributes.map((att: any) => (
                        <Attribute att={att} key={att.id} setFilters={setFilters} setShowAttr={setShowAttr} />
                    ))}
            </List>
        </Container>
    );
}

interface IAttributeProps {
    att: any;
    setFilters: React.Dispatch<React.SetStateAction<IFilters[]>>;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
}
function Attribute({att, setFilters, setShowAttr}: IAttributeProps): JSX.Element {
    const addFilter = () => {
        setFilters(filters => [
            ...filters,
            {
                key: filters.length,
                operator: operatorFilter.and,
                where: whereFilter.contains,
                value: '',
                attribute: att.id,
                active: true
            }
        ]);

        setShowAttr(false);
    };

    return (
        <List.Item>
            <List.Icon name="square" size="large" verticalAlign="middle" />
            <List.Content verticalAlign="middle">
                <Container>
                    <Wrapper>
                        <span>{att.id}</span>
                        <Button floated="right" icon="plus" onClick={addFilter} />
                    </Wrapper>
                </Container>
            </List.Content>
        </List.Item>
    );
}

export default AttributeList;
