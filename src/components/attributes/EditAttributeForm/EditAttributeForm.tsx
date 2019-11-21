import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
// import {useLang} from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {IFormError} from '../../../_types//errors';
import EditAttributeInfosForm from '../EditAttributeInfosForm';
import EditAttributePermissions from '../EditAttributePermissions';
import ActionListConfigurer from '../ActionListConfigurer';

interface IEditAttributeFormProps {
    attribute: GET_ATTRIBUTES_attributes_list | null;
    onSubmit: (formData: any) => void;
    onPermsSettingsSubmit: (formData: any) => void;
    onCheckIdExists: (val: string) => Promise<boolean>;
    errors?: IFormError;
    readOnly: boolean;
}

/* tslint:disable-next-line:variable-name */
const EditAttributeForm = ({
    attribute,
    onSubmit,
    onPermsSettingsSubmit,
    errors,
    readOnly,
    onCheckIdExists
}: IEditAttributeFormProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const headerLabel =
        attribute !== null && attribute.label
            ? localizedLabel(attribute.label, availableLanguages)
            : t('attributes.new');

    const panes = [
        {
            key: 'infos',
            menuItem: t('attributes.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <EditAttributeInfosForm
                        attribute={attribute}
                        onSubmit={onSubmit}
                        errors={errors}
                        readOnly={readOnly}
                        onCheckIdExists={onCheckIdExists}
                    />
                </Tab.Pane>
            )
        }
    ];

    if (attribute !== null) {
        panes.push(
            {
                key: 'permissions',
                menuItem: t('attributes.permissions'),
                render: () => {
                    return (
                        <Tab.Pane key="permissions" className="grow flex-col height100">
                            <EditAttributePermissions
                                attribute={attribute}
                                onSubmitSettings={onPermsSettingsSubmit}
                                readOnly={readOnly}
                            />
                        </Tab.Pane>
                    );
                }
            },
            {
                key: 'configurer',
                menuItem: t('attributes.action_list'),
                render: () => {
                    return (
                        <Tab.Pane key="configurer" className="grow flex-col height100">
                            <ActionListConfigurer attribute={attribute} />
                        </Tab.Pane>
                    );
                }
            }
        );
    }

    return (
        <>
            <Header className="no-grow">{headerLabel}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col height100" />
        </>
    );
};

export default EditAttributeForm;
