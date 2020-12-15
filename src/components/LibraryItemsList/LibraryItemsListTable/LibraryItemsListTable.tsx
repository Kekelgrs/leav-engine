// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, EditOutlined, HeartOutlined, SettingOutlined} from '@ant-design/icons';
import {Checkbox, Dropdown, Menu, Spin, Table} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Resizable} from 'react-resizable';
import styled from 'styled-components';
import {infosCol} from '../../../constants/constants';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {displayTypeToPreviewSize, getItemKeyFromColumn, localizedLabel, paginationOptions} from '../../../utils';
import {AttributeFormat, AttributeType, IItem, IItemsColumn, IRecordEdition, ITableHeader} from '../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import Cell from './Cell';
import Header from './Header';
import './LibraryItemsListTable.css';
import LibraryItemsModal from './LibraryItemsModal';

const Wrapper = styled.div`
    padding: 0 1rem;
`;

const LoadingContainer = styled.div`
    height: 60vh;
    display: grid;
    place-items: center;
`;

interface ILibraryItemsListTableProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const initialColumnsLimit = 5;

function LibraryItemsListTable({stateItems, dispatchItems}: ILibraryItemsListTableProps): JSX.Element {
    const {t} = useTranslation();

    const [{lang}] = useLang();

    const [tableColumns, setTableColumn] = useState<ITableHeader[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [recordEdition, setRecordEdition] = useState<IRecordEdition>({
        show: false
    });

    useEffect(() => {
        const handleResize = index => (e, {size}) => {
            const widthLimited = size.width < 50 ? 50 : size.width;

            setTableColumn(cols => {
                const nextColumns = [...cols];
                nextColumns[index] = {
                    ...nextColumns[index],
                    width: widthLimited
                };
                return nextColumns;
            });
        };

        if (stateItems.attributes.length && !stateItems.columns.length) {
            // initialize columns in state
            const initialTableColumns: IItemsColumn[] = stateItems.attributes.reduce(
                (acc, attribute, index) =>
                    index < initialColumnsLimit
                        ? [
                              ...acc,
                              {
                                  id: attribute.id,
                                  library: attribute.library,
                                  type: attribute.type
                              }
                          ]
                        : acc,
                [
                    {
                        id: infosCol,
                        library: stateItems.attributes[0].library,
                        type: AttributeType.simple
                    } as IItemsColumn
                ]
            );

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_COLUMNS,
                columns: initialTableColumns
            });
        } else if (stateItems.attributes.length && stateItems.columns.length) {
            const handleCheckboxClick = (item: IItem) => {
                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
                    itemsSelected: {...stateItems.itemsSelected, [item.id]: !stateItems.itemsSelected[item.id]}
                });
            };

            const handleClickEditMode = (item: IItem) => {
                setRecordEdition(({show}) => {
                    return {item, show: !show};
                });
            };

            const switchSelectionMode = (item: IItem) => {
                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
                    selectionMode: !stateItems.selectionMode
                });

                dispatchItems({
                    type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
                    itemsSelected: {...stateItems.itemsSelected, [item.id]: true}
                });
            };

            setTableColumn(columns => {
                const actionsColumn = {
                    title: <span></span>,
                    type: AttributeType.simple,
                    library: '',
                    dataIndex: 'actions',
                    key: 'actions',
                    width: 20,
                    onHeaderCell: () => ({
                        width: 20,
                        onResize: handleResize(-1)
                    }),
                    render: item =>
                        stateItems.selectionMode ? (
                            <Checkbox
                                checked={stateItems.itemsSelected[item.id]}
                                onClick={() => handleCheckboxClick(item)}
                                disabled={stateItems.allSelected}
                            />
                        ) : (
                            <Dropdown
                                overlay={
                                    <Menu>
                                        <Menu.Item onClick={() => switchSelectionMode(item)}>
                                            <CheckOutlined /> {t('items-list-row.switch-to-selection-mode')}
                                        </Menu.Item>
                                        <Menu.Item onClick={() => handleClickEditMode(item)}>
                                            <EditOutlined /> {t('items-list-row.edit')}
                                        </Menu.Item>
                                        <Menu.Item>
                                            <HeartOutlined /> Like
                                        </Menu.Item>
                                    </Menu>
                                }
                            >
                                <SettingOutlined style={{display: 'flex', justifyContent: 'center'}} />
                            </Dropdown>
                        )
                };

                const newColumns = stateItems.columns.map((col, index) => {
                    const attribute = stateItems.attributes.find(att => att.id === col.id);

                    if (attribute) {
                        let displayLabel: string;

                        if (col.extendedData?.path) {
                            displayLabel = col.extendedData?.path.split('.').pop() || '';
                        } else if (typeof attribute.label === 'string') {
                            displayLabel = attribute.label;
                        } else {
                            displayLabel = localizedLabel(attribute.label, lang);
                        }

                        return {
                            title: (
                                <Header name={attribute.id} type={attribute.type}>
                                    {displayLabel}
                                </Header>
                            ),
                            type: attribute.type,
                            dataIndex: getItemKeyFromColumn(col),
                            key: col.id,
                            library: col.library,
                            width: 100,
                            onHeaderCell: column => ({
                                width: column.width,
                                onResize: handleResize(index)
                            }),
                            render: text => (
                                <Cell
                                    value={text}
                                    column={col}
                                    size={displayTypeToPreviewSize(stateItems.displayType)}
                                    format={attribute.format}
                                />
                            )
                        };
                    }

                    // only the infos columns as no attributes
                    return {
                        title: (
                            <Header name={infosCol} type={AttributeType.simple}>
                                {t('items_list.table.infos')}
                            </Header>
                        ),
                        type: AttributeType.simple,
                        library: '',
                        dataIndex: infosCol,
                        key: infosCol,
                        width: 100,
                        onHeaderCell: column => ({
                            width: column.width,
                            onResize: handleResize(index)
                        }),
                        render: text => (
                            <Cell
                                value={text}
                                size={displayTypeToPreviewSize(stateItems.displayType)}
                                format={AttributeFormat.text}
                            />
                        )
                    };
                });
                return [actionsColumn, ...newColumns];
            });
        }
    }, [
        t,
        dispatchItems,
        lang,
        stateItems.attributes,
        stateItems.columns,
        stateItems.displayType,
        stateItems.itemsSelected,
        stateItems.selectionMode,
        stateItems.allSelected
    ]);

    useEffect(() => {
        if (stateItems.items) {
            setTableData(
                stateItems.items.reduce((acc, item, index) => {
                    if (index < stateItems.pagination) {
                        return [
                            ...acc,
                            {
                                key: item.id,
                                actions: item,
                                ...item
                            }
                        ];
                    }
                    return acc;
                }, [] as any)
            );
        }
    }, [stateItems.items, stateItems.columns, stateItems.pagination, setTableData]);

    const handlePageChange = (page: number, pageSize?: number) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: (page - 1) * (pageSize ?? 0)
        });
    };

    const setPagination = (current: number, size: number) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_PAGINATION,
            pagination: size
        });
    };

    return (
        <Wrapper>
            {stateItems.itemsLoading ? (
                <LoadingContainer>
                    <Spin size="large" />
                </LoadingContainer>
            ) : (
                <Table
                    bordered
                    columns={(tableColumns as unknown) as any}
                    dataSource={tableData}
                    tableLayout="fixed"
                    scroll={{x: 'calc(100vw - 4rem)', y: 'calc(100vh - 15rem)'}}
                    components={{
                        header: {
                            cell: ResizableTitle
                        }
                    }}
                    style={{marginTop: '8px'}}
                    pagination={{
                        total: stateItems.itemsTotalCount,
                        defaultPageSize: stateItems.pagination,
                        current: stateItems.offset / stateItems.pagination + 1,
                        showSizeChanger: true,
                        pageSizeOptions: paginationOptions.map(option => option.toString()),
                        onChange: handlePageChange,
                        onShowSizeChange: setPagination,
                        position: ['bottomCenter']
                    }}
                />
            )}

            <LibraryItemsModal
                showModal={recordEdition.show}
                closeModal={() => setRecordEdition(re => ({...re, show: false}))}
                values={recordEdition.item}
                updateValues={item => setRecordEdition(re => ({...re, item}))}
            />
        </Wrapper>
    );
}

const ResizableTitle = props => {
    const {onResize, width, ...restProps} = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            handle={
                <span
                    className="react-resizable-handle"
                    onClick={e => {
                        e.stopPropagation();
                    }}
                />
            }
            onResize={onResize}
            draggableOpts={{enableUserSelectHack: false}}
        >
            <th {...restProps} />
        </Resizable>
    );
};

export default LibraryItemsListTable;
