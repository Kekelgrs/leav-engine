// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {allowedTypeOperator, flatArray, getUniqueId} from '../../../../utils';
import {
    AttributeFormat,
    ConditionFilter,
    FilterTypes,
    IAttribute,
    IAttributesChecked,
    IFilter,
    IFilterSeparator
} from '../../../../_types/types';
import ListAttributes from '../../../ListAttributes';
import {
    ILibraryItemListState,
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes
} from '../../LibraryItemsListReducer';

interface IAttributeListProps {
    stateItems: ILibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    setFilters: React.Dispatch<React.SetStateAction<Array<Array<IFilter | IFilterSeparator>>>>;
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
    updateFilters: () => void;
}

function AddFilter({
    stateItems,
    dispatchItems,
    setFilters,
    showAttr,
    setShowAttr,
    updateFilters
}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const [attributesChecked, setAttributesChecked] = useState<IAttributesChecked[]>([]);

    const [newAttributes, setNewAttributes] = useState<IAttribute[]>([]);

    const addFilters = () => {
        const noDuplicateNewAttribute = newAttributes.filter(
            newAttribute =>
                !stateItems.attributes.some(
                    attribute => attribute.id === newAttribute.id && attribute.library === newAttribute.library
                )
        );

        const allAttributes = [...stateItems.attributes, ...noDuplicateNewAttribute];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES,
            attributes: allAttributes
        });

        setFilters(filters => {
            const separators = filters.map(filtersGroup =>
                filtersGroup.filter(filter => filter.type === FilterTypes.separator)
            );

            const newFilters: IFilter[] = attributesChecked.map((attributeChecked, index) => {
                if (attributeChecked?.extendedData) {
                    const format = attributeChecked.extendedData.format;
                    const defaultConditionOptions =
                        (format && allowedTypeOperator[AttributeFormat[format]][0]) || ConditionFilter.equal;

                    const lastFilterIsSeparatorCondition = flatArray(separators).some(
                        separator => separator.key === filters.length + index - 1
                    );

                    const attributeId = attributeChecked.extendedData.path.split('.').pop() ?? '';

                    const newFilter: IFilter = {
                        type: FilterTypes.filter,
                        key: filters.length + index,
                        id: getUniqueId(),
                        operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                        condition: defaultConditionOptions,
                        value: '',
                        attributeId,
                        active: true,
                        format,
                        originAttributeData: attributeChecked.originAttributeData,
                        treeData: attributeChecked.treeData,
                        extendedData: attributeChecked.extendedData
                    };
                    return newFilter;
                }

                const attribute = stateItems.attributes.find(
                    a => a.id === attributeChecked.id && a.library === attributeChecked.library
                );

                // take the first operator for the format of the attribute
                const defaultConditionOptions =
                    (attribute?.format && allowedTypeOperator[AttributeFormat[attribute?.format]][0]) ||
                    ConditionFilter.equal;

                // if the new filter is after a separator, don't set operator
                // separator key is the filters length when separator was add
                const lastFilterIsSeparatorCondition = flatArray(separators).some(
                    separator => separator.key === filters.length + index - 1
                );

                return {
                    type: FilterTypes.filter,
                    key: filters.length + index,
                    id: getUniqueId(),
                    operator: filters.length && !lastFilterIsSeparatorCondition ? true : false,
                    condition: defaultConditionOptions,
                    value: '',
                    attributeId: attributeChecked.id,
                    active: true,
                    format: attribute?.format ?? AttributeFormat.text,
                    originAttributeData: attributeChecked.originAttributeData,
                    treeData: attributeChecked.treeData,
                    extendedData: attributeChecked.extendedData
                };
            });

            return [...filters, newFilters] as Array<Array<IFilter | IFilterSeparator>>;
        });
        setShowAttr(false);
        setAttributesChecked([]);
        updateFilters();
    };

    const handleCancel = () => {
        setAttributesChecked([]);
        setShowAttr(false);
    };

    return (
        <Modal
            visible={showAttr}
            onCancel={() => setShowAttr(false)}
            title={t('filters.modal-header')}
            width="70rem"
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('attributes-list.cancel')}
                </Button>,
                <Button key="add" type="primary" onClick={addFilters}>
                    {t('attributes-list.add')}
                </Button>
            ]}
        >
            <ListAttributes
                attributes={stateItems.attributes}
                useCheckbox
                attributesChecked={attributesChecked}
                setAttributesChecked={setAttributesChecked}
                setNewAttributes={setNewAttributes}
            />
        </Modal>
    );
}

export default AddFilter;
