import * as React from 'react';
import {Image} from 'semantic-ui-react';
import {getInvertColor, getRandomColor} from 'src/utils/utils';
import styled, {CSSObject} from 'styled-components';

interface IRecordPreviewProps {
    label: string;
    color: string | null;
    image: string | null;
    style?: CSSObject;
}

interface IGeneratedPreviewProps {
    bgColor: string;
    fontColor: string;
    style?: CSSObject;
}

/* tslint:disable-next-line:variable-name */
const GeneratedPreview = styled.div<IGeneratedPreviewProps>`
    ${props => props.style || ''}
    background-color: ${props => props.bgColor};
    color: ${props => props.fontColor};
    font-size: 1.1em;
    height: 2em;
    width: 2em;
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;
GeneratedPreview.displayName = 'GeneratedPreview';

class RecordPreview extends React.Component<IRecordPreviewProps> {
    constructor(props: IRecordPreviewProps) {
        super(props);
    }

    public shouldComponentUpdate = (p): boolean => p.color !== this.props.color || p.image !== this.props.image;

    public render() {
        const {label, color, image, style} = this.props;

        if (image) {
            return <Image src={image} avatar style={style} />;
        }

        const initial = label[0].toLocaleUpperCase();

        const bgColor = color || getRandomColor();
        const fontColor = getInvertColor(bgColor);

        return (
            <GeneratedPreview className="initial" bgColor={bgColor} fontColor={fontColor} style={style}>
                {initial}
            </GeneratedPreview>
        );
    }
}

export default RecordPreview;
