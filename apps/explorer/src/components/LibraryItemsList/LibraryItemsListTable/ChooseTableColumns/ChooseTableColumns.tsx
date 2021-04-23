// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setAttributes} from 'redux/attributes';
import {setFields} from 'redux/fields';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {useActiveLibrary} from '../../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {getFieldsKeyFromAttribute, localizedLabel} from '../../../../utils';
import {AttributeFormat, AttributeType, IAttribute, IField, ISelectedAttribute} from '../../../../_types/types';
import AttributesSelectionList from '../../../AttributesSelectionList';

interface IChooseTableColumnsProps {
    openChangeColumns: boolean;
    setOpenChangeColumns: (openChangeColumns: boolean) => void;
}

function ChooseTableColumns({openChangeColumns, setOpenChangeColumns}: IChooseTableColumnsProps): JSX.Element {
    const {t} = useTranslation();

    const {fields, attributes} = useAppSelector(state => state);
    const dispatch = useAppDispatch();

    const [activeLibrary] = useActiveLibrary();
    const [{lang}] = useLang();

    const [selectedAttributes, setSelectedAttributes] = useState<ISelectedAttribute[]>(
        fields.fields.map(col => {
            const currentAttribute = attributes.attributes.find(
                attribute => attribute.id === col.id && attribute.library === col.library
            );

            return {
                id: col.id,
                path: col.id,
                library: col.library,
                label: currentAttribute?.label ?? null,
                type: col.type,
                multiple_values: !!col.multipleValues
            };
        })
    );

    useEffect(() => {
        setSelectedAttributes(
            fields.fields.map(col => {
                const currentAttribute = attributes.attributes.find(
                    attribute => attribute.id === col.id && attribute.library === col.library
                );

                return {
                    id: col.id,
                    path: col.id,
                    library: col.library,
                    label: currentAttribute?.label ?? null,
                    type: col.type,
                    multiple_values: !!col.multipleValues
                };
            })
        );
    }, [attributes.attributes, fields.fields, setSelectedAttributes]);

    const handleSubmit = () => {
        const noDuplicateNewAttribute: IAttribute[] = selectedAttributes
            .filter(
                selectedAttribute =>
                    !attributes.attributes.some(
                        attribute =>
                            attribute.id === selectedAttribute.id && attribute.library === selectedAttribute.library
                    )
            )
            .map(a => ({
                ...a,
                isLink: a.type === AttributeType.tree,
                isMultiple: a.multiple_values,
                format: a.format ?? undefined
            }));

        const allAttributes = [...attributes.attributes, ...noDuplicateNewAttribute];

        dispatch(setAttributes(allAttributes));

        const newFields: IField[] = selectedAttributes.reduce((acc, selectedAttribute) => {
            const attribute = allAttributes.find(
                currentAttr =>
                    currentAttr.id === selectedAttribute.id && currentAttr.library === selectedAttribute.library
            );

            if (!attribute) {
                return acc;
            }

            const key = getFieldsKeyFromAttribute(selectedAttribute);

            const label = typeof attribute.label === 'string' ? attribute.label : localizedLabel(attribute.label, lang);

            const embeddedData = selectedAttribute.embeddedFieldData && {
                format: selectedAttribute.embeddedFieldData?.format ?? AttributeFormat.text,
                path: selectedAttribute.path
            };

            const field: IField = {
                id: selectedAttribute.id,
                library: selectedAttribute.library,
                label,
                key,
                type: selectedAttribute.type,
                format: attribute.format,
                parentAttributeData: selectedAttribute?.parentAttributeData,
                treeData: selectedAttribute.treeData,
                embeddedData
            };

            return [...acc, field];
        }, [] as IField[]);

        dispatch(setFields(newFields));

        setOpenChangeColumns(false);
    };

    const handleCancel = () => {
        setOpenChangeColumns(false);
    };

    // hack to disable warning "Droppable: unsupported nested scroll container" from react-beautiful-dnd,
    // remove "overflow: auto" on class "ant-modal-wrap"
    const elements: any = document.getElementsByClassName('ant-modal-wrap');
    if (elements.length) {
        elements[0].style.overflow = 'initial';
    }

    return (
        <Modal
            visible={openChangeColumns}
            onCancel={() => setOpenChangeColumns(false)}
            title={t('table-columns-selection.header')}
            width="70rem"
            centered
            footer={[
                <Button key="Cancel" onClick={handleCancel}>
                    {t('table-columns-selection.cancel')}
                </Button>,
                <Button key="Submit" onClick={handleSubmit} type="primary">
                    {t('table-columns-selection.submit')}
                </Button>
            ]}
        >
            <AttributesSelectionList
                library={activeLibrary?.id ?? ''}
                selectedAttributes={selectedAttributes}
                onSelectionChange={setSelectedAttributes}
            />
        </Modal>
    );
}

export default ChooseTableColumns;
