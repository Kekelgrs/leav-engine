// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {getInitials, getPreviewSize} from 'utils';

interface ISimplisticRecordPreviewProps {
    label: string;
}

const Wrapper = styled.div`
    border-radius: 50%;
    border: 1px solid ${themingVar['@border-color-base']};
    width: calc(${getPreviewSize(null, true)} + 0.5rem);
    height: calc(${getPreviewSize(null, true)} + 0.5rem);
    text-align: center;
`;

function SimplisticRecordPreview({label}: ISimplisticRecordPreviewProps): JSX.Element {
    const initial = getInitials(label, 1);

    return <Wrapper data-testid="simplistic-preview">{initial}</Wrapper>;
}

export default SimplisticRecordPreview;
