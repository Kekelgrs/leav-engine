import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import {localizedLabel} from 'src/utils/utils';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {IFormError} from 'src/_types/errors';
import EditAttributeInfosForm from '../EditAttributeInfosForm';
import EditAttributePermissions from '../EditAttributePermissions';

interface IEditAttributeFormProps extends WithNamespaces {
    attribute: GET_ATTRIBUTES_attributes | null;
    onSubmit: (formData: any) => void;
    onPermsSettingsSubmit: (formData: any) => void;
    errors?: IFormError;
}

function EditAttributeForm({
    t,
    i18n: i18next,
    attribute,
    onSubmit,
    onPermsSettingsSubmit,
    errors
}: IEditAttributeFormProps) {
    const headerLabel =
        attribute !== null && attribute.label ? localizedLabel(attribute.label, i18next) : t('attributes.new');

    const panes = [
        {
            key: 'infos',
            menuItem: t('attributes.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <EditAttributeInfosForm attribute={attribute} onSubmit={onSubmit} errors={errors} />
                </Tab.Pane>
            )
        }
    ];

    if (attribute !== null) {
        panes.push({
            key: 'permissions',
            menuItem: t('attributes.permissions'),
            render: () => {
                return (
                    <Tab.Pane key="permissions" className="grow flex-col height100">
                        <EditAttributePermissions attribute={attribute} onSubmitSettings={onPermsSettingsSubmit} />
                    </Tab.Pane>
                );
            }
        });
    }

    return (
        <React.Fragment>
            <Header className="no-grow">{headerLabel}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col height100" />
        </React.Fragment>
    );
}

export default withNamespaces()(EditAttributeForm);
