import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Form} from 'semantic-ui-react';
import FormFieldWrapper from 'src/components/shared/FormFieldWrapper';
import {formatIDString, getSysTranslationQueryLanguage} from 'src/utils/utils';
import {GET_TREES_trees} from 'src/_gqlTypes/GET_TREES';
import LibrariesSelector from '../LibrariesSelector';

interface IEditTreeInfosFormProps extends WithNamespaces {
    tree: GET_TREES_trees | null;
    onSubmit: (formData: any) => void;
}

interface IEditTreeInfosFormState extends GET_TREES_trees {
    existingTree: boolean;
}

class EditTreeInfosForm extends React.Component<IEditTreeInfosFormProps, IEditTreeInfosFormState> {
    constructor(props: IEditTreeInfosFormProps) {
        super(props);

        const defaultTree = {
            id: '',
            label: null,
            system: false,
            libraries: []
        };

        this.state = {
            ...(this.props.tree !== null ? this.props.tree : defaultTree),
            existingTree: !!props.tree && !!props.tree.id
        };
    }

    public render() {
        const {t, i18n} = this.props;
        const {id, label, libraries, existingTree, system} = this.state;
        const langs = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',') : [];
        const defaultLang = process.env.REACT_APP_DEFAULT_LANG;
        const userLang = getSysTranslationQueryLanguage(i18n);

        return (
            <Form onSubmit={this._handleSubmit}>
                <Form.Group grouped>
                    <label>{t('trees.label')}</label>
                    {langs.map(lang => (
                        <FormFieldWrapper key={lang}>
                            <Form.Input
                                label={lang}
                                width="4"
                                name={'label/' + lang}
                                required={lang === defaultLang}
                                value={label && label[lang] ? label[lang] : ''}
                                onChange={this._handleChange}
                            />
                        </FormFieldWrapper>
                    ))}
                </Form.Group>
                <FormFieldWrapper>
                    <Form.Input
                        label={t('trees.ID')}
                        width="4"
                        disabled={existingTree}
                        name="id"
                        onChange={this._handleChange}
                        value={id}
                    />
                </FormFieldWrapper>
                <FormFieldWrapper>
                    <LibrariesSelector
                        disabled={system}
                        lang={userLang}
                        fluid
                        selection
                        label={t('trees.libraries')}
                        placeholder={t('trees.libraries')}
                        width="4"
                        name="libraries"
                        onChange={this._handleChange}
                        value={libraries}
                    />
                </FormFieldWrapper>
                <Form.Group style={{marginTop: 10}}>
                    <Form.Button>{t('admin.submit')}</Form.Button>
                </Form.Group>
            </Form>
        );
    }

    private _handleChange = (event, data) => {
        const value = data.type === 'checkbox' ? data.checked : data.value;
        const name: string = data.name;
        const stateUpdate: Partial<GET_TREES_trees> = {};

        if (name.indexOf('/') !== -1) {
            const [field, lang] = name.split('/');
            stateUpdate[field] = {...this.state[field]};
            stateUpdate[field][lang] = value;

            // On new library, automatically generate an ID based on label
            if (!this.state.existingTree && field === 'label' && lang === process.env.REACT_APP_DEFAULT_LANG) {
                stateUpdate.id = formatIDString(value);
            }
        } else {
            stateUpdate[name] = value;
        }

        this.setState(stateUpdate as IEditTreeInfosFormState);
    }

    private _handleSubmit = e => {
        this.props.onSubmit(this.state);
    }
}

export default withNamespaces()(EditTreeInfosForm);
