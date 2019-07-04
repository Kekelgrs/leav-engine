import React, {useState} from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {
    SaveLibAttributesMutation,
    saveLibAttributesMutation
} from '../../../queries/libraries/saveLibAttributesMutation';
import {getSysTranslationQueryLanguage} from '../../../utils/utils';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import AttributesList from '../../attributes/AttributesList';
import AttributesSelectionModal from '../../attributes/AttributesSelectionModal';
import EditAttribute from '../../attributes/EditAttribute';
import UnlinkLibAttribute from '../UnlinkLibAttribute';

interface IEditLibraryAttributesProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries | null;
    readOnly: boolean;
}

function EditLibraryAttributes({library, readOnly, t, i18n: i18next}: IEditLibraryAttributesProps) {
    const [showNewAttrModal, setShowNewAttrModal] = useState<boolean>(false);
    const [showAddExistingAttrModal, setShowAddExistingAttrModal] = useState<boolean>(false);
    const onRowClick = () => null;
    const lang = getSysTranslationQueryLanguage(i18next);

    const _openNewAttrModal = () => {
        setShowNewAttrModal(true);
    };

    const _closeNewAttrModal = () => {
        setShowNewAttrModal(false);
    };

    const _openAddExistingAttrModal = () => {
        setShowAddExistingAttrModal(true);
    };

    const _closeAddExistingAttrModal = () => {
        setShowAddExistingAttrModal(false);
    };
    return (
        library && (
            <SaveLibAttributesMutation mutation={saveLibAttributesMutation}>
                {saveLibAttr => {
                    const saveAttributes = async (attributesToSave: string[]) => {
                        return saveLibAttr({
                            variables: {libId: library.id, attributes: attributesToSave},
                            refetchQueries: [{query: getLibsQuery, variables: {id: library.id, lang}}]
                        });
                    };

                    const _onNewAttributeSaved = async (newAttr: GET_ATTRIBUTES_attributes) => {
                        if (library === null) {
                            return;
                        }

                        const attributesList = library.attributes
                            ? [...library.attributes.map(a => a.id), newAttr.id]
                            : [newAttr.id];

                        await saveAttributes(attributesList);
                        _closeNewAttrModal();
                    };

                    const _onClickUnlink = async (attributesList: string[]) => {
                        return saveAttributes(attributesList);
                    };

                    const onExistingAttrAdded = async (selection: string[]) => {
                        const newLibAttributes = library.attributes ? library.attributes.map(a => a.id) : [];
                        newLibAttributes.push(...selection);

                        await saveAttributes(newLibAttributes);
                        _closeAddExistingAttrModal();
                        return;
                    };

                    return (
                        library && (
                            <div>
                                {!readOnly && (
                                    <Button icon labelPosition="left" size="medium" onClick={_openNewAttrModal}>
                                        <Icon name="plus" />
                                        {t('attributes.new')}
                                    </Button>
                                )}

                                {!readOnly && (
                                    <Button icon labelPosition="left" size="medium" onClick={_openAddExistingAttrModal}>
                                        <Icon name="plus" />
                                        {t('libraries.link_existing_attribute')}
                                    </Button>
                                )}

                                <AttributesList
                                    loading={false}
                                    attributes={library ? library.attributes : []}
                                    onRowClick={onRowClick}
                                    withFilters={false}
                                >
                                    {!readOnly && (
                                        <UnlinkLibAttribute
                                            library={library}
                                            key="unlink_attr_btn"
                                            onUnlink={_onClickUnlink}
                                        />
                                    )}
                                </AttributesList>

                                {!readOnly && (
                                    <Modal size="large" open={showNewAttrModal} onClose={_closeNewAttrModal} centered>
                                        <Modal.Header>{t('attributes.new')}</Modal.Header>
                                        <Modal.Content>
                                            <EditAttribute attributeId={null} afterSubmit={_onNewAttributeSaved} />
                                        </Modal.Content>
                                    </Modal>
                                )}

                                {library.attributes && (
                                    <AttributesSelectionModal
                                        openModal={showAddExistingAttrModal}
                                        onClose={_closeAddExistingAttrModal}
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

export default withNamespaces()(EditLibraryAttributes);
