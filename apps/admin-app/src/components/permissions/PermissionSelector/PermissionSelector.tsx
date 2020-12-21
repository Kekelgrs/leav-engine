// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import hexToRgba from 'hex-rgba';
import React from 'react';
import {Input, InputOnChangeData} from 'semantic-ui-react';
import styled from 'styled-components';

interface IPermissionSelectorProps {
    value: boolean | null;
    heritValue: boolean;
    onChange: (permValue: boolean | null) => void;
    as: any;
    forbiddenColor: string;
    allowedColor: string;
    readOnly?: boolean;
}

function PermissionSelector({
    value,
    heritValue,
    as,
    onChange,
    forbiddenColor,
    allowedColor,
    readOnly
}: IPermissionSelectorProps): JSX.Element {
    const permValToInputVal = permVal => (permVal === false ? 0 : permVal === null ? 1 : 2);
    const inputValToPermVal = {
        0: false,
        1: null,
        2: true
    };

    const bgColors = {
        0: forbiddenColor,
        1: '#FFFFFF',
        2: allowedColor
    };

    const inputVal = permValToInputVal(value);
    const bgColor = value !== null ? bgColors[inputVal] : hexToRgba(bgColors[permValToInputVal(heritValue)], 40);

    const Wrapper = styled(as)`
        background: ${bgColor};
    `;
    Wrapper.displayName = 'Wrapper';

    const _handleChange = (e: React.ChangeEvent, data: InputOnChangeData) => onChange(inputValToPermVal[data.value]);

    return (
        <Wrapper>
            <Input
                type="range"
                min="0"
                max="2"
                step="1"
                value={inputVal}
                disabled={readOnly}
                style={{border: 'none'}}
                onChange={_handleChange}
                transparent
                fluid
            />
        </Wrapper>
    );
}
PermissionSelector.defaultProps = {
    readOnly: false
};

export default PermissionSelector;
