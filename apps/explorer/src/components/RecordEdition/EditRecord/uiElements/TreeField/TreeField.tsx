// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings} from '@leav/utils';
import {List, Popover} from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import Dimmer from 'components/shared/Dimmer';
import ErrorMessage from 'components/shared/ErrorMessage';
import {ITreeNodeWithRecord} from 'components/shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {GET_FORM_forms_list_elements_elements_attribute_TreeAttribute} from '_gqlTypes/GET_FORM';
import {SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue} from '_gqlTypes/SAVE_VALUE_BATCH';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import AddValueBtn from '../../shared/AddValueBtn';
import NoValue from '../../shared/NoValue';
import {APICallStatus, IFormElementProps} from '../../_types';
import TreeFieldValue from './TreeFieldValue';
import ValuesAdd from './ValuesAdd';

const Wrapper = styled.div<{isValuesAddVisible: boolean}>`
    position: relative;
    border: 1px solid ${themingVar['@border-color-base']};
    margin-bottom: 1.5em;
    border-radius: ${themingVar['@border-radius-base']};
    background: ${themingVar['@default-bg']};
    z-index: ${p => (p.isValuesAddVisible ? 1 : 'auto')};

    .ant-list-items {
        max-height: 320px;
        overflow-y: auto;
    }

    .ant-list-footer {
        padding: 0;
    }
`;

const FieldLabel = styled(Paragraph)`
    && {
        top: calc(50% - 0.9em);
        font-size: 0.9em;
        padding: 0 0.5em;
        color: ${themingVar['@leav-secondary-font-color']};
        z-index: 1;
        margin-bottom: 0;
    }
`;

const FooterWrapper = styled.div`
    text-align: left;
`;

function TreeField({
    element,
    recordValues,
    record,
    onValueSubmit,
    onValueDelete
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const attribute = element.attribute as GET_FORM_forms_list_elements_elements_attribute_TreeAttribute;
    const {readOnly: isRecordReadOnly} = useRecordEditionContext();

    const [fieldValues, setFieldValues] = useState<IRecordPropertyTree[]>(
        (recordValues[element.settings.attribute] as IRecordPropertyTree[]) ?? []
    );

    useEffect(() => {
        if (record) {
            // Update values only for existing record. On creation, we handle everything here
            setFieldValues((recordValues[element.settings.attribute] as IRecordPropertyTree[]) ?? []);
        }
    }, [recordValues, element.settings.attribute, record]);

    const [errorMessage, setErrorMessage] = useState<string | string[]>();
    const [isValuesAddVisible, setIsValuesAddVisible] = useState<boolean>();
    const isReadOnly = element.attribute?.system || isRecordReadOnly || !attribute.permissions.edit_value;

    const data = fieldValues.map(val => ({
        ...val,
        key: val.id_value
    }));

    const renderItem = (value: IRecordPropertyTree) => {
        const _handleDelete = async () => {
            const deleteRes = await onValueDelete(value.id_value, attribute.id);

            if (deleteRes.status === APICallStatus.SUCCESS) {
                setFieldValues(fieldValues.filter(val => val.id_value !== value.id_value));
                return;
            }
        };

        return <TreeFieldValue value={value} attribute={attribute} onDelete={_handleDelete} isReadOnly={isReadOnly} />;
    };

    const canAddValue = !isReadOnly && (attribute.multiple_values || !fieldValues.length);

    const _handleAddValue = () => {
        setIsValuesAddVisible(true);
    };

    const _handleSubmitSelectTreeNodeModal = async (treeNodes: ITreeNodeWithRecord[]) => {
        const valuesToSave = treeNodes.map(node => ({
            attribute,
            idValue: null,
            value: node
        }));

        const res = await onValueSubmit(valuesToSave);

        if (res.status === APICallStatus.ERROR) {
            setErrorMessage(res.error);
        } else if (res.values) {
            setFieldValues([...fieldValues, ...(res.values as SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue[])]);
        }

        if (res?.errors?.length) {
            const selectedNodesById = treeNodes.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

            const errorsMessage = res.errors.map(err => {
                const linkedRecordLabel = selectedNodesById[err.input].title || selectedNodesById[err.input].id;

                return `${linkedRecordLabel}: ${err.message}`;
            });
            setErrorMessage(errorsMessage);
        } else {
            setIsValuesAddVisible(false);
        }
    };

    const ListFooter =
        fieldValues.length && canAddValue ? (
            <FooterWrapper>
                <AddValueBtn onClick={_handleAddValue} disabled={isValuesAddVisible} />
            </FooterWrapper>
        ) : null;

    const _handleCloseValuesAdd = () => setIsValuesAddVisible(false);

    const _handleCloseError = () => {
        setErrorMessage('');
    };

    return (
        <>
            {isValuesAddVisible && <Dimmer onClick={_handleCloseValuesAdd} />}
            <Wrapper isValuesAddVisible={isValuesAddVisible}>
                <FieldLabel ellipsis={{rows: 1, tooltip: true}}>{element.settings.label}</FieldLabel>
                <List
                    dataSource={data}
                    renderItem={renderItem}
                    split
                    locale={{
                        emptyText: <NoValue canAddValue={canAddValue} onAddValue={_handleAddValue} />
                    }}
                    footer={ListFooter}
                />
                {isValuesAddVisible && (
                    <ValuesAdd
                        attribute={attribute}
                        onAdd={_handleSubmitSelectTreeNodeModal}
                        onClose={_handleCloseValuesAdd}
                    />
                )}
            </Wrapper>
            {errorMessage && (
                <Popover
                    placement="bottomLeft"
                    visible={!!errorMessage}
                    content={<ErrorMessage error={errorMessage} onClose={_handleCloseError} />}
                ></Popover>
            )}
        </>
    );
}

export default TreeField;
