import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {localizedLabel} from 'src/utils/utils';
import {RecordIdentity_whoAmI} from 'src/_gqlTypes/RecordIdentity';
import styled, {CSSObject} from 'styled-components';
import RecordPreview from '../RecordPreview';

interface IRecordCardProps extends WithNamespaces {
    record: RecordIdentity_whoAmI;
    style?: CSSObject;
}

interface IWrapperProps {
    recordColor: string | null;
    style?: CSSObject;
}

/* tslint:disable:variable-name */
const Wrapper = styled.div<IWrapperProps>`
    border-left: 5px solid ${props => props.recordColor || 'transparent'};
    display: flex;
    flex-direction: row;
    ${props => props.style}
`;
Wrapper.displayName = 'Wrapper';

const CardPart = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const PreviewWrapper = styled(CardPart)`
    margin: 0 0.8em;
`;

const RecordLabel = styled.div`
    font-weight: bold;
`;

const LibLabel = styled.div`
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    fontsize: 0.9em;
`;
/* tslint:enable:variable-name */

function RecordCard({record, style, i18n}: IRecordCardProps): JSX.Element {
    return (
        <Wrapper recordColor={record.color} style={style} className="ui fluid">
            <PreviewWrapper className="ui">
                <RecordPreview label={record.label || record.id} color={record.color} image={record.preview} />
            </PreviewWrapper>
            <CardPart className="ui">
                <RecordLabel>{record.label || record.id}</RecordLabel>
                <LibLabel>{localizedLabel(record.library.label, i18n) || record.library.id}</LibLabel>
            </CardPart>
        </Wrapper>
    );
}

export default withNamespaces()(RecordCard);
