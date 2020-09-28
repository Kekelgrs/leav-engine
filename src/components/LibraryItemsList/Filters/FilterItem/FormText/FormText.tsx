import {Form, Input} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {IFilter} from '../../../../../_types/types';

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
`;

const CustomForm = styled(Form)`
    width: 100%;
`;

interface IFromTextProps {
    filter: IFilter;
    updateFilterValue: (newValue: any, valueSize?: number | 'auto') => void;
}

const FormText = ({filter, updateFilterValue}: IFromTextProps) => {
    let valueChange = false;
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();
        updateFilterValue(newValue);
        valueChange = true;
    };

    const handleResize = (size: {width: number; height: number}) => {
        if (valueChange) {
            updateFilterValue(filter.value, size.height);
        }
        valueChange = false;
    };

    return (
        <CustomForm>
            <TextAreaWrapper>
                <Input.TextArea
                    disabled={!filter.active}
                    value={filter.value}
                    onChange={e => handleChange(e)}
                    onResize={handleResize}
                    style={{height: filter.valueSize}}
                />
            </TextAreaWrapper>
        </CustomForm>
    );
};

export default FormText;
