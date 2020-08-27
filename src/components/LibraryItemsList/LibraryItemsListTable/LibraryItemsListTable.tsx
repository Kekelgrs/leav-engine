import {useQuery} from '@apollo/client';
import {Spin, Table} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Resizable} from 'react-resizable';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {displayTypeToPreviewSize, getItemKeyFromColumn, localizedLabel, paginationOptions} from '../../../utils';
import {AttributeFormat, AttributeType, IItemsColumn, IRecordEdition, ITableHeader} from '../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import Cell from './Cell';
import ChooseTableColumns from './ChooseTableColumns';
import Header from './Header';
import './LibraryItemsListTable.css';
import LibraryItemsModal from './LibraryItemsModal';

interface ILibraryItemsListTableProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const initialColumnsLimit = 5;

function LibraryItemsListTable({stateItems, dispatchItems}: ILibraryItemsListTableProps): JSX.Element {
    const {t} = useTranslation();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const [tableColumns, setTableColumn] = useState<ITableHeader[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [openChangeColumns, setOpenChangeColumns] = useState(false);
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
                        id: 'infos',
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
            setTableColumn(columns => {
                return stateItems.columns.map((col, index) => {
                    const attribute = stateItems.attributes.find(att => att.id === col.id);

                    if (attribute) {
                        const display = col.extendedData?.path
                            ? col.extendedData?.path.split('.').pop() || ''
                            : typeof attribute.label === 'string'
                            ? attribute.label
                            : localizedLabel(attribute.label, lang);

                        return {
                            title: (
                                <Header
                                    name={attribute.id}
                                    type={attribute.type}
                                    setOpenChangeColumns={setOpenChangeColumns}
                                >
                                    {display}
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
                            <Header
                                name={'infos'}
                                type={AttributeType.simple}
                                setOpenChangeColumns={setOpenChangeColumns}
                            >
                                {t('items_list.table.infos')}
                            </Header>
                        ),
                        type: AttributeType.simple,
                        library: '',
                        dataIndex: 'infos',
                        key: 'infos',
                        fixed: 'left',
                        width: 200,
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
            });
        }
    }, [t, dispatchItems, lang, stateItems.attributes, stateItems.columns, stateItems.displayType]);

    useEffect(() => {
        if (stateItems.items) {
            setTableData(
                stateItems.items.reduce((acc, item) => {
                    return [
                        ...acc,
                        {
                            key: item.id,
                            ...item
                        }
                    ];
                }, [] as any)
            );
        }
    }, [stateItems.items, stateItems.columns, setTableData]);

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
        <>
            <ChooseTableColumns openChangeColumns={openChangeColumns} setOpenChangeColumns={setOpenChangeColumns} />

            {stateItems.itemsLoading ? (
                <Spin />
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
                    pagination={{
                        total: stateItems.itemsTotalCount,
                        pageSize: stateItems.pagination,
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
        </>
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
