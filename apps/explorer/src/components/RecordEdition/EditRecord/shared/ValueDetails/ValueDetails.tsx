// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Collapse, Divider} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import PropertiesList from 'components/shared/PropertiesList';
import {IRecordPropertyTree, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {localizedTranslation} from 'utils';
import {
    GET_FORM_forms_list_elements_elements_attribute,
    GET_FORM_forms_list_elements_elements_attribute_TreeAttribute
} from '_gqlTypes/GET_FORM';
import {AttributeType} from '_gqlTypes/globalTypes';
import TreeValuePath from './TreeValuePath';

interface IValueDetailsProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute;
    value: RecordProperty;
}

const AttributeTitle = styled.div`
    font-weight: bold;
    padding: 1em;
`;

const AttributeDescription = styled.div`
    color: rgba(0, 0, 0, 0.5);
    padding: 0 1em;
`;

const CloseButton = styled(CloseOutlined)`
    cursor: pointer;
    position: absolute;
    right: 1em;
    top: 1em;
`;

const {Panel} = Collapse;

function ValueDetails({attribute, value}: IValueDetailsProps): JSX.Element {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const {dispatch} = useEditRecordReducer();

    const _handleClose = () => dispatch({type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE, value: null});

    const valueDetailsContent = value?.modified_at
        ? [
              {
                  title: t('record_edition.modified_at'),
                  value: `${new Date(value.modified_at * 1000).toLocaleString()} ${
                      value?.modified_by ? ` ${t('record_edition.by')} ${value.modified_by.whoAmI.label}` : ''
                  }`
              }
          ]
        : [];

    const attributeDetailsContent = [
        {
            title: t('record_edition.attribute.id'),
            value: attribute.id
        },
        {
            title: t('record_edition.attribute.type'),
            value: t(`record_edition.attribute.type_${attribute.type}`)
        },
        {
            title: t('record_edition.attribute.format'),
            value: attribute.format ? t(`record_edition.attribute.format_${attribute.format}`) : null
        }
    ];

    return (
        <>
            <CloseButton onClick={_handleClose} />
            <AttributeTitle>{localizedTranslation(attribute.label, lang)}</AttributeTitle>
            <AttributeDescription>{localizedTranslation(attribute.description, lang)}</AttributeDescription>
            <Divider style={{margin: '.5em 0'}} />
            <Collapse
                bordered={false}
                defaultActiveKey={['attribute', 'value']}
                style={{background: 'none'}}
                destroyInactivePanel
            >
                {valueDetailsContent.length && (
                    <Panel key="value" header={t('record_edition.value_details_section')}>
                        <PropertiesList items={valueDetailsContent} />
                    </Panel>
                )}
                <Panel key="attribute" header={t('record_edition.attribute_details_section')}>
                    <PropertiesList items={attributeDetailsContent} />
                </Panel>
                {attribute.type === AttributeType.tree && (
                    <Panel key="path" header={t('record_edition.path_section')}>
                        <TreeValuePath
                            value={value as IRecordPropertyTree}
                            attribute={attribute as GET_FORM_forms_list_elements_elements_attribute_TreeAttribute}
                        />
                    </Panel>
                )}
            </Collapse>
        </>
    );
}

export default ValueDetails;
