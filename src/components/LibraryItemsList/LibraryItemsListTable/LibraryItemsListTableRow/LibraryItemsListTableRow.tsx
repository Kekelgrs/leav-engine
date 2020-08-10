import objectPath from 'object-path';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, CheckboxProps, Grid, Icon, Popup, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {checkTypeIsLink, displayTypeToPreviewSize} from '../../../../utils';
import {
    AttributeFormat,
    AttributeType,
    DisplayListItemTypes,
    IExtendedData,
    IItem,
    IItemsColumn,
    PreviewSize
} from '../../../../_types/types';
import RecordCard from '../../../shared/RecordCard';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

const getRowHeight = (displayType: DisplayListItemTypes) => {
    switch (displayType) {
        case DisplayListItemTypes.listSmall:
            return '3rem';
        case DisplayListItemTypes.listMedium:
            return '6rem';
        case DisplayListItemTypes.listBig:
            return '9rem';
        case DisplayListItemTypes.tile:
            return '0rem';
    }
};

interface handleValueDisplayProps {
    value: any;
    format?: AttributeFormat;
    type?: AttributeType;
    isMultiple: boolean;
    size: PreviewSize;
    extendedData?: IExtendedData;
}

const handleValueDisplay = ({value, format, type, isMultiple, size, extendedData}: handleValueDisplayProps) => {
    if (!type) {
        return 'error: no type';
    }

    if (value !== undefined && value !== null) {
        switch (format) {
            case AttributeFormat.extended:
                if (extendedData) {
                    let parseValue = {};

                    try {
                        parseValue = JSON.parse(value);
                    } catch {
                        return 'error';
                    }

                    // Remove the attribute name from the path and change it to array
                    const extendedPathArr = extendedData.path.split('.');
                    extendedPathArr.shift();

                    return handleValueDisplay({
                        value: objectPath.get(parseValue, extendedPathArr),
                        format: extendedData.format,
                        type,
                        isMultiple,
                        size,
                        extendedData
                    });
                }
                return;
            case AttributeFormat.boolean:
                return <Icon name={value ? 'check' : 'cancel'} />;
            case AttributeFormat.numeric:
            case AttributeFormat.text:
            default:
                if (isMultiple) {
                    return value?.map(val =>
                        handleValueDisplay({
                            value: val,
                            format,
                            type,
                            isMultiple: !!Array.isArray(val),
                            size,
                            extendedData
                        })
                    );
                } else if (checkTypeIsLink(type)) {
                    return <RecordCard record={{...value.whoAmI}} size={size} />;
                } else if (type === AttributeType.tree) {
                    return <RecordCard key={value?.record?.whoAmI?.id} record={{...value.record.whoAmI}} size={size} />;
                }

                return value;
        }
    }
};

interface RowProps {
    selected: boolean;
    size: DisplayListItemTypes;
}

const TableRow = styled(Table.Row)<RowProps>`
    &&&&& {
        height: ${({size}) => getRowHeight(size)};
        background: ${({selected}) => (selected ? 'hsla(202, 100%, 50%, 0.15)' : 'none')};

        .actions {
            opacity: 0;
        }

        &:hover {
            .actions {
                opacity: 1;
            }
        }
    }
`;

const Actions = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    height: 100%;
`;

interface ILibraryItemsListTableRowProps {
    item: IItem;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    showRecordEdition: (item: IItem) => void;
}
function LibraryItemsListTableRow({
    item,
    stateItems,
    dispatchItems,
    showRecordEdition
}: ILibraryItemsListTableRowProps): JSX.Element {
    const [isSelected, setIsSelect] = useState<boolean>(!!stateItems.itemsSelected[item.id]);

    const handleClickRow = () => {
        if (stateItems.selectionMode) {
            setIsSelect(s => !s);

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
                itemsSelected: {...stateItems.itemsSelected, [item.id]: !isSelected}
            });
        }
    };

    useEffect(() => {
        setIsSelect(!!stateItems.itemsSelected[item.id]);
    }, [stateItems.itemsSelected, item]);

    return (
        <>
            <TableRow
                key={`${item.id}_${item.library}`}
                selected={isSelected}
                onClick={handleClickRow}
                size={stateItems.displayType}
            >
                {stateItems.columns.map(column =>
                    column.id === 'infos' ? (
                        <InfosRow
                            key={column.id}
                            item={item}
                            stateItems={stateItems}
                            dispatchItems={dispatchItems}
                            isSelected={isSelected}
                            setIsSelect={setIsSelect}
                            showRecordEdition={showRecordEdition}
                        />
                    ) : (
                        <Row
                            key={`${column.id}_${column.library}_${column.originAttributeData?.id}_${
                                column.extendedData?.path ?? column.treeData?.libraryTypeName
                            }`}
                            item={item}
                            column={column}
                            stateItems={stateItems}
                        />
                    )
                )}
            </TableRow>
        </>
    );
}

interface RowsProps {
    item: IItem;
    column: IItemsColumn;
    stateItems: LibraryItemListState;
}

const Row = ({item, column, stateItems}: RowsProps) => {
    const currentAtt = stateItems.attributes.find(att => att.id === column.id && att.library === column.library);

    const display = handleValueDisplay({
        value: item[`${column.library}_${column.id}`],
        format: currentAtt?.format,
        type: currentAtt?.type ?? column.type,
        isMultiple: currentAtt?.isMultiple || false,
        size: displayTypeToPreviewSize(stateItems.displayType),
        extendedData: column.extendedData
    });

    return (
        <Table.Cell>
            <div>{display}</div>
        </Table.Cell>
    );
};

interface IInfosRow {
    item: IItem;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    isSelected: boolean;
    setIsSelect: React.Dispatch<React.SetStateAction<boolean>>;
    showRecordEdition: (item: IItem) => void;
}

const InfosRow = ({item, stateItems, dispatchItems, isSelected, setIsSelect, showRecordEdition}: IInfosRow) => {
    const {t} = useTranslation();

    const handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>, {checked}: CheckboxProps) => {
        setIsSelect(s => !s);

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {...stateItems.itemsSelected, [item.id]: !!checked}
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: false
        });
    };

    const switchMode = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: !stateItems.selectionMode
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {...stateItems.itemsSelected, [item.id]: true}
        });
    };

    return (
        <>
            <Table.Cell>
                <Grid>
                    <Grid.Row>
                        <RecordCard record={{...item}} size={displayTypeToPreviewSize(stateItems.displayType)} />

                        <Actions className="actions">
                            {stateItems.selectionMode ? (
                                <Button.Group size="small">
                                    <Checkbox onChange={handleCheckboxChange} checked={isSelected} />
                                </Button.Group>
                            ) : (
                                <Button.Group size="small">
                                    <Popup
                                        hoverable={false}
                                        content={t('items-list-row.switch-to-selection-mode')}
                                        trigger={
                                            <Button
                                                active={stateItems.selectionMode}
                                                icon="check"
                                                onClick={switchMode}
                                            />
                                        }
                                    />
                                    <Popup
                                        hoverable={false}
                                        content={t('items-list-row.edit')}
                                        trigger={<Button icon="write" onClick={() => showRecordEdition(item)} />}
                                    />
                                    <Button icon="like" />
                                    <Button icon="ellipsis horizontal" />
                                </Button.Group>
                            )}
                        </Actions>
                    </Grid.Row>
                </Grid>
            </Table.Cell>
        </>
    );
};

export default LibraryItemsListTableRow;
