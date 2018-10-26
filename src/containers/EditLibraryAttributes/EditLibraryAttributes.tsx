import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import AttributesList from 'src/components/AttributesList';
import {SaveLibAttributesMutation, saveLibAttributesMutation} from 'src/queries/saveLibAttributesMutation';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import AttributesSelectionModal from '../AttributesSelectionModal';
import EditAttribute from '../EditAttribute';
import UnlinkLibAttribute from '../UnlinkLibAttribute';

interface IEditLibraryAttributesProps {
    library: GET_LIBRARIES_libraries | null;
    t: TranslationFunction;
}

interface IEditLibraryAttributesState {
    showNewAttrModal: boolean;
    showAddExistingAttrModal: boolean;
}

class EditLibraryAttributes extends React.Component<IEditLibraryAttributesProps, IEditLibraryAttributesState> {
    constructor(props: IEditLibraryAttributesProps) {
        super(props);

        this.state = {
            showNewAttrModal: false,
            showAddExistingAttrModal: false
        };
    }

    public render() {
        const {library, t} = this.props;
        const {showNewAttrModal, showAddExistingAttrModal} = this.state;
        const onRowClick = () => null;

        // TODO: put submit button in Modal.Actions (and handle form submission from here)
        return (
            library && (
                <SaveLibAttributesMutation mutation={saveLibAttributesMutation}>
                    {saveLibAttr => {
                        const saveAttributes = (attributesToSave: string[]) => {
                            return saveLibAttr({variables: {libId: library.id, attributes: attributesToSave}});
                        };

                        const _onNewAttributeSaved = async (newAttr: GET_ATTRIBUTES_attributes) => {
                            if (library === null) {
                                return;
                            }

                            const attributesList = library.attributes
                                ? [...library.attributes.map(a => a.id), newAttr.id]
                                : [newAttr.id];

                            await saveAttributes(attributesList);
                            this._closeNewAttrModal();
                        };

                        const _onClickUnlink = async (attributesList: string[]) => {
                            return saveAttributes(attributesList);
                        };

                        const onExistingAttrAdded = async (selection: string[]) => {
                            const newLibAttributes = library.attributes ? library.attributes.map(a => a.id) : [];
                            newLibAttributes.push(...selection);

                            await saveAttributes(newLibAttributes);
                            this._closeAddExistingAttrModal();
                            return;
                        };

                        return (
                            library && (
                                <div>
                                    <Button icon labelPosition="left" size="medium" onClick={this._openNewAttrModal}>
                                        <Icon name="plus" />
                                        {t('attributes.new')}
                                    </Button>

                                    <Button
                                        icon
                                        labelPosition="left"
                                        size="medium"
                                        onClick={this._openAddExistingAttrModal}
                                    >
                                        <Icon name="plus" />
                                        {t('libraries.link_existing_attribute')}
                                    </Button>

                                    <AttributesList
                                        loading={false}
                                        attributes={library ? library.attributes : []}
                                        onRowClick={onRowClick}
                                        withFilters={false}
                                    >
                                        <UnlinkLibAttribute
                                            library={library}
                                            key="unlink_attr_btn"
                                            onUnlink={_onClickUnlink}
                                        />
                                    </AttributesList>

                                    <Modal
                                        size="large"
                                        open={showNewAttrModal}
                                        onClose={this._closeNewAttrModal}
                                        centered
                                    >
                                        <Modal.Header>{t('attributes.new')}</Modal.Header>
                                        <Modal.Content>
                                            <EditAttribute attributeId={null} afterSubmit={_onNewAttributeSaved} />
                                        </Modal.Content>
                                    </Modal>

                                    {library.attributes && (
                                        <AttributesSelectionModal
                                            openModal={showAddExistingAttrModal}
                                            onClose={this._closeAddExistingAttrModal}
                                            onSubmit={onExistingAttrAdded}
                                            selection={library.attributes.map(a => a.id)}
                                        />
                                    )}
                                </div>
                            )
                        );
                    }}
                </SaveLibAttributesMutation>
            )
        );
    }

    private _openNewAttrModal = () => {
        this.setState({showNewAttrModal: true});
    }

    private _closeNewAttrModal = () => {
        this.setState({showNewAttrModal: false});
    }

    private _openAddExistingAttrModal = () => {
        this.setState({showAddExistingAttrModal: true});
    }

    private _closeAddExistingAttrModal = () => {
        this.setState({showAddExistingAttrModal: false});
    }
}

export default translate()(EditLibraryAttributes);
