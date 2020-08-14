import {CloseOutlined} from '@ant-design/icons';
import {Button, Card, Select} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {IFilter, IFilterSeparator, OperatorFilter} from '../../../../_types/types';

const CustomSegment = styled(Card)`
    display: flex;
    justify-content: space-between;
    align-items: top;
    &&& {
        margin: 0.5rem 0.2rem;
    }
`;

interface IFilterSeparatorProps {
    separator: IFilterSeparator;
    operatorOptions: {
        text: string;
        value: OperatorFilter;
    }[];
    setFilters: React.Dispatch<React.SetStateAction<(IFilter | IFilterSeparator)[]>>;
    separatorOperator: OperatorFilter;
    setSeparatorOperator: React.Dispatch<React.SetStateAction<OperatorFilter>>;
    updateFilters: () => void;
}

function FilterSeparator({
    separator,
    operatorOptions,
    setFilters,
    separatorOperator,
    setSeparatorOperator,
    updateFilters: updateFilter
}: IFilterSeparatorProps): JSX.Element {
    const deleteSeparator = () => {
        setFilters(filters => {
            let restFilter = filters.filter(f => f.key !== separator.key);

            return restFilter;
        });

        // reorder the key of the array
        updateFilter();
    };

    const changeOperator = (operatorFilter: OperatorFilter) => {
        setSeparatorOperator(operatorFilter);
    };

    return (
        <CustomSegment>
            <Button disabled={!separator.active}>is disable</Button>
            <Select value={separatorOperator} onChange={e => changeOperator(e)}>
                {operatorOptions.map(operator => (
                    <Select.Option value={operator.value}>{operator.text}</Select.Option>
                ))}
            </Select>
            <span>
                <Button icon={<CloseOutlined />} size="small" onClick={deleteSeparator} />
            </span>
        </CustomSegment>
    );
}

export default FilterSeparator;
