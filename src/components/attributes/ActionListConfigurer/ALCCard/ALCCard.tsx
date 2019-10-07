import React, {useEffect, useState, useRef} from 'react';
import {useDrag, useDrop} from 'react-dnd-cjs';
import {getEmptyImage} from 'react-dnd-html5-backend';
import itemTypes from '../ItemTypes';
import Param from './ActionContent/Param';

import Connector from '../ALCConnectors';

import {ActionRow} from '../stylesComps';

import {IAction, IColorDic, IParamInput} from '../interfaces/interfaces';

import {Icon, Card, Button} from 'semantic-ui-react';

//////////////////// INTERFACES

export interface ICardProps {
    id: string;
    action: IAction;
    moveCard?: (id: string, isOver: boolean, to: number) => void;
    findCard?: (id: string) => number | undefined;
    origin: string;
    addActionToList: (actionName: string, atIndex: number) => void;
    removeActionFromList?: (id: string) => void;
    marginTop?: string;
    currentIndex?: number;
    setCurrentIndex?: (idx: number) => void;
    getConnectorStatus?: (indx: number, action: {}) => boolean | undefined;
    colorTypeDictionnary: IColorDic;
    changeParam?: (input: IParamInput) => void;
    index?: number;
    dragging?: boolean;
}

//////////////////// COMPONENT

function ALCCard({
    id,
    action,
    moveCard,
    findCard,
    origin,
    removeActionFromList,
    marginTop,
    setCurrentIndex,
    colorTypeDictionnary,
    changeParam,
    index,
    dragging
}: ICardProps) {
    const container = useRef(null);
    const [internalWidth, setWidth] = useState(null);
    const [paramOpen, toggleParams] = useState(false);

    //////////////////// DRAG AND DROP

    const [{isDragging}, drag, preview] = useDrag({
        item: {
            type: itemTypes.ACTION,
            id,
            originalIndex: findCard && findCard(id),
            origin,
            action,
            colorTypeDictionnary,
            width: internalWidth
        },
        end(item: any, monitor) {
            if (setCurrentIndex) {
                setCurrentIndex(-1);
            }
            if (!monitor.didDrop()) {
                if (removeActionFromList && !item.action.isSystem) {
                    removeActionFromList(id);
                }
            }
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    });

    const [{isOver}, drop] = useDrop({
        accept: itemTypes.ACTION,
        canDrop: () => false,
        hover(item, monitor) {
            monitor.isOver({shallow: true});
            if (findCard && moveCard) {
                const overIndex = findCard(id);
                const itemCopy = JSON.parse(JSON.stringify(item));
                if (itemCopy.origin === 'ALCReserve') {
                    if (origin === 'ALCList') {
                        if (setCurrentIndex) {
                            setCurrentIndex(Number(overIndex));
                        }
                    }
                    return;
                }
                if (overIndex !== undefined) {
                    moveCard(itemCopy.id, isOver, overIndex);
                }
            }
        },
        collect: monitor => ({
            isOver: monitor.isOver()
        })
    });

    //////////////////// COMPONENT FUNCTIONS

    const onRemoveButtonClicked = () => {
        tryAndRemove(action.id);
    };

    const handleToggleParams = () => {
        toggleParams(!paramOpen);
    };

    const tryAndRemove = (actId: number) => {
        if (removeActionFromList) {
            removeActionFromList(String(actId));
        }
    };

    //////////////////// SETTING THE COMPONENT

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: false});
        // @ts-ignore
        setWidth(container && container.current && container.current.offsetWidth);
    }, [preview]);

    //////////////////// COMPONENT CONSTANTS (CALCULATED)

    const opacity = isDragging ? 0 : 1;
    const inputs = action.input_types;
    const outputs = action.output_types;

    //////////////////// RENDER

    function renderListCard(listAction: IAction) {
        return (
            <ActionRow
                ref={node => drag(drop(node))}
                opacity={opacity}
                marginTop={marginTop}
                index={index}
                isDragging={dragging}
            >
                <Card fluid>
                    <Connector
                        inputs={inputs}
                        dictionnary={colorTypeDictionnary}
                        isDragging={dragging}
                    />
                    <Card.Content>
                        <h3>{listAction.name}</h3>
                        <p>{listAction.description}</p>
                        {listAction.isSystem ? (
                            <Icon
                                style={{
                                    position: 'absolute',
                                    right: '6px',
                                    top: '15px',
                                    color: '#383939'
                                }}
                                name="lock"
                                title="action is system"
                            />
                        ) : (
                            <Button
                                style={{
                                    position: 'absolute',
                                    right: '2px',
                                    top: '10px',
                                    fontSize: '0.8em'
                                }}
                                circular
                                icon="trash"
                                onClick={onRemoveButtonClicked}
                            />
                        )}
                        {listAction.params && listAction.params.length > 0 && (
                            <div style={{textAlign: 'right'}} onClick={handleToggleParams}>
                                <Card.Meta>
                                    {paramOpen ? 'Hide Params' : 'Display Params'}
                                    <Icon name={paramOpen ? 'triangle down' : 'triangle left'} />
                                </Card.Meta>
                            </div>
                        )}
                    </Card.Content>
                    {paramOpen && (
                        <Card.Content>
                            <div style={{margin: '5px 0'}}>
                                {listAction.params &&
                                    listAction.params.length &&
                                    listAction.params.map((param, i) => (
                                        <Param
                                            index={index}
                                            key={i}
                                            actionId={listAction.id !== undefined ? listAction.id : -1}
                                            param={param}
                                            changeParam={changeParam}
                                        />
                                    ))}
                            </div>
                        </Card.Content>
                    )}
                    <Connector
                        inputs={outputs}
                        dictionnary={colorTypeDictionnary}
                        isDragging={dragging}
                    />
                </Card>
            </ActionRow>
        );
    }

    return (
        <div ref={container}>
            {renderListCard(action)}
        </div>
    );
}

export default ALCCard;
