import styled from 'styled-components';

interface IHiddenDiv {
    extend: boolean;
    hover: boolean;
}

interface IActionRow {
    opacity: number;
    marginTop: string | undefined;
    index: number | undefined;
    isDragging: boolean | undefined;
}

//////////////////// ALCContainer

/* tslint:disable-next-line:variable-name */
export const ExternalContainer = styled.div`
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
    justify-items: stretch;
    overflow: hidden;
`;

/* tslint:disable-next-line:variable-name */
export const ReserveContainer = styled.div`
    position: relative;
    height: 100%;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-right: 5px;
`;

/* tslint:disable-next-line:variable-name */
export const ListsContainer = styled.div`
    position: relative;
    max-height: 100%;
    align-self: stretch;
    display: flex;
    width: calc(100% - 5px);
    margin-left: 5px;
`;

//////////////////// ALCReserve

/* tslint:disable-next-line:variable-name */
export const AvailableActionsContainer = styled.div`
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 2px;
    padding-right: 5px;
    flex: 1 1 0;
`;

//////////////////// ALCList

/* tslint:disable-next-line:variable-name */
export const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
`;

/* tslint:disable-next-line:variable-name */
export const ListContent = styled.div`
    padding: 0 5px;
    position: relative;
    flex: 1 0 0;
    cursor: move;
    border: 1px solid #bcbec0;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

/* tslint:disable-next-line:variable-name */
export const HiddenDiv = styled.div<IHiddenDiv>`
    min-height: ${props => (props.extend && props.hover ? '50px' : '0px')};
    flex-grow: 1;
    height: 'auto';
`;

/* tslint:disable-next-line:variable-name */
export const ALCPlaceholder = styled.div`
    color: #c8c8c8;
    font-size: 1.2em;
    text-align: center;
    padding-top: 30px;
    margin: 3px;
    height: 90px;
    background: #ececec;
    border: 2px dashed #c8c8c8;
    border-radius: 3px;
    box-shadow: inset 0px 0px 3px 0px #00000038;
`;

//////////////////// ALCCard

/* tslint:disable-next-line:variable-name */
export const ActionRow = styled.div<IActionRow>`
    background-color: ${props => (props.isDragging ? '#dddddd' : '#f9fafb')};
    border-style: solid;
    border-color: #dddddd;
    border-width: 0 2px 0 2px;
    border-radius: 3px;
    opacity: ${props => props.opacity};
    margin-top: ${props => props.marginTop};
`;