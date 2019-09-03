import {Formik, FormikProps} from 'formik';
import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import styled from 'styled-components';
import * as yup from 'yup';
import {formatIDString, getFieldError, localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {ErrorTypes, IFormError} from '../../../_types/errors';
import FormFieldWrapper from '../../shared/FormFieldWrapper';

interface IEditLibraryInfosFormProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries_list | null;
    onSubmit: (formData: any) => void;
    readonly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

/* tslint:disable-next-line:variable-name */
const FormGroupWithMargin = styled(Form.Group)`
    margin-top: 10px;
`;

const langs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
const defaultLang = process.env.REACT_APP_DEFAULT_LANG;

// TODO: add validation, handle lang, getfielderror on attribute
function EditLibraryInfosForm({
    library,
    onSubmit,
    readonly,
    t,
    i18n,
    errors,
    onCheckIdExists
}: IEditLibraryInfosFormProps) {
    const existingLib = library !== null;

    const defaultLibrary: GET_LIBRARIES_libraries_list = {
        id: '',
        system: false,
        label: {
            fr: '',
            en: ''
        },
        attributes: [],
        permissions_conf: null,
        recordIdentityConf: {
            label: null,
            color: null,
            preview: null
        }
    };

    const initialValues: GET_LIBRARIES_libraries_list = library === null ? defaultLibrary : library;

    const libAttributesOptions = initialValues.attributes
        ? initialValues.attributes.map(a => ({
              key: a.id,
              value: a.id,
              text: localizedLabel(a.label, i18n) || a.id
          }))
        : [];
    libAttributesOptions.unshift({key: '', value: '', text: ''});

    const _handleSubmit = values => {
        onSubmit(values);
    };

    const serverValidationErrors =
        errors && errors.extensions.code === ErrorTypes.VALIDATION_ERROR ? errors.extensions.fields : {};

    let idValidator = yup
        .string()
        .required()
        .matches(/^[a-z0-9_]+$/);

    if (!existingLib) {
        // TODO: ID unicity validation is not debounced. As it's not trivial to implement, check future implementation
        // in formik (https://github.com/jaredpalmer/formik/pull/1597)
        idValidator = idValidator.test('isIdUnique', t('admin.validation_errors.id_exists'), onCheckIdExists);
    }

    const validationSchema: yup.ObjectSchema<Partial<GET_LIBRARIES_libraries_list>> = yup.object().shape({
        label: yup.object().shape({
            [defaultLang || langs[0]]: yup.string().required()
        }),
        id: idValidator,
        recordIdentityConf: yup.object().shape({
            label: yup.string().nullable(),
            color: yup.string().nullable(),
            preview: yup.string().nullable()
        })
    });

    const _renderForm = ({
        handleSubmit,
        handleBlur,
        setFieldValue,
        errors: inputErrors,
        values,
        touched
    }: FormikProps<GET_LIBRARIES_libraries_list>) => {
        const _handleLabelChange = (e, data) => {
            _handleChange(e, data);

            const {name, value} = data;
            const [field, subfield] = name.split('.');

            // On new attribute, automatically generate an ID based on label
            if (!existingLib && field === 'label' && subfield === process.env.REACT_APP_DEFAULT_LANG) {
                setFieldValue('id', formatIDString(value));
            }
        };

        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const name: string = data.name;

            setFieldValue(name, value);
        };

        const {id, label, recordIdentityConf} = values;

        const _getErrorByField = (fieldName: string): string =>
            getFieldError<GET_LIBRARIES_libraries_list>(fieldName, touched, serverValidationErrors || {}, inputErrors);

        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group grouped>
                    <label>{t('libraries.label')}</label>
                    {langs.map(lang => (
                        <FormFieldWrapper key={lang} error={_getErrorByField(`label.${lang}`)}>
                            <Form.Input
                                label={`${lang} ${lang === defaultLang ? '*' : ''}`}
                                name={'label.' + lang}
                                disabled={readonly}
                                value={label[lang]}
                                onChange={_handleLabelChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper error={_getErrorByField('id')}>
                    <Form.Input
                        label={t('attributes.ID')}
                        disabled={existingLib || readonly}
                        name="id"
                        onChange={_handleChange}
                        onBlur={handleBlur}
                        value={id}
                    />
                </FormFieldWrapper>
                <Form.Group grouped>
                    <label>{t('libraries.record_identity')}</label>
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.label')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf.label"
                            disabled={readonly}
                            label={t('libraries.record_identity_label')}
                            value={recordIdentityConf && recordIdentityConf.label ? recordIdentityConf.label : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.color')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf.color"
                            disabled={readonly}
                            label={t('libraries.record_identity_color')}
                            value={recordIdentityConf && recordIdentityConf.color ? recordIdentityConf.color : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                    <FormFieldWrapper error={_getErrorByField('recordIdentityConf.preview')}>
                        <Form.Dropdown
                            search
                            selection
                            options={libAttributesOptions}
                            name="recordIdentityConf.preview"
                            disabled={readonly}
                            label={t('libraries.record_identity_preview')}
                            value={recordIdentityConf && recordIdentityConf.preview ? recordIdentityConf.preview : ''}
                            onChange={_handleChange}
                        />
                    </FormFieldWrapper>
                </Form.Group>
                {!readonly && (
                    <FormGroupWithMargin>
                        <Form.Button>{t('admin.submit')}</Form.Button>
                    </FormGroupWithMargin>
                )}
            </Form>
        );
    };
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={_handleSubmit}
            render={_renderForm}
            validationSchema={validationSchema}
        />
    );
}

export default withNamespaces()(EditLibraryInfosForm);
