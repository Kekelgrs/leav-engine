// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {Checkbox, Divider, Form, Input, Modal, Select} from 'antd';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {localizedLabel} from 'utils';
import {ViewTypes} from '_gqlTypes/globalTypes';
import {defaultSort, viewSettingsField} from '../../../constants/constants';
import addViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesView
} from '../../../graphQL/mutations/views/addViewMutation';
import {IActiveLibrary} from '../../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar';
import {ILabel, ViewType} from '../../../_types/types';

type IFormValues = {
    [x: string]: string;
} & {type: ViewTypes; shared: boolean};

interface IAddViewProps {
    visible: boolean;
    onClose: () => void;
    activeLibrary?: IActiveLibrary; // use activeLibrary props instead of hook useActiveLibrary to avoid apollo warning
}

function AddView({visible, onClose, activeLibrary}: IAddViewProps): JSX.Element {
    const {t} = useTranslation();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [{availableLangs, defaultLang, lang}] = useLang();
    const [form] = Form.useForm();

    const [addView] = useMutation<IAddViewMutation, IAddViewMutationVariables>(addViewMutation, {
        ignoreResults: true
    });

    const _handleSubmit = async (formValues: IFormValues) => {
        setConfirmLoading(true);
        if (activeLibrary) {
            const label = availableLangs.reduce((acc, availableLang) => {
                acc[availableLang] = formValues[`viewName-${availableLang}`];
                return acc;
            }, {} as ILabel);

            const description = availableLangs.reduce((acc, availableLang) => {
                acc[availableLang] = formValues[`description-${availableLang}`];
                return acc;
            }, {} as ILabel);

            // Fields
            let viewFields: string[] = [];
            if (formValues.type === ViewTypes.list) {
                viewFields = searchState.fields.map(field => {
                    const settingsField = field.key;
                    return settingsField;
                });
            }

            const color = formValues.color ?? themingVar['@primary-color'];

            const newView: IAddViewMutationVariablesView = {
                library: activeLibrary?.id,
                type: formValues.type,
                shared: !!formValues.shared,
                label,
                description,
                color,
                filters: searchState.queryFilters,
                sort: defaultSort,
                settings: [
                    {
                        name: viewSettingsField,
                        value: viewFields
                    }
                ]
            };

            try {
                // save view in backend
                const newViewRes = await addView({variables: {view: newView}});

                searchDispatch({
                    type: SearchActionTypes.SET_VIEW,
                    view: {
                        current: {
                            id: newViewRes.data.saveView.id,
                            label: localizedLabel(label, lang),
                            type: formValues.type,
                            shared: !!formValues.shared,
                            sort: defaultSort
                        },
                        reload: true
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }

        // reset form fields values
        form.resetFields();

        setConfirmLoading(false);
        onClose();
    };

    const _handleOk = () => {
        form.submit();
    };

    const _handleCancel = () => {
        onClose();
    };

    return (
        <Modal
            title={t('view.add-view.new-view')}
            visible={visible}
            onOk={_handleOk}
            onCancel={_handleCancel}
            destroyOnClose={true}
            confirmLoading={confirmLoading}
        >
            <Form
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                form={form}
                onFinish={_handleSubmit}
                initialValues={{type: ViewType.list}}
            >
                {availableLangs.map(availableLang => (
                    <div key={availableLang}>
                        <h2>{t(`language.${availableLang}`)}</h2>

                        <Form.Item
                            label={t('view.add-view.view-name')}
                            name={`viewName-${availableLang}`}
                            rules={defaultLang === availableLang ? [{required: true}] : []}
                            data-testid={`input-viewName-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={t('view.add-view.view-description')}
                            name={`description-${availableLang}`}
                            data-testid={`input-description-${availableLang}`}
                        >
                            <Input />
                        </Form.Item>

                        <Divider />
                    </div>
                ))}

                <Form.Item label={t('view.add-view.view-type')} name="type" data-testid="input-type">
                    <Select>
                        <Select.Option value={ViewTypes.list}>{t('view.type-list')}</Select.Option>
                        <Select.Option value={ViewTypes.cards}>{t('view.type-cards')}</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="shared"
                    valuePropName="checked"
                    data-testid="input-shared"
                    wrapperCol={{offset: 8, span: 16}}
                >
                    <Checkbox>{t('view.add-view.view-shared')}</Checkbox>
                </Form.Item>

                <Form.Item label={t('view.add-view.view-color')} name="color" data-testid="input-color">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AddView;
