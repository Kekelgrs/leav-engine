import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from 'semantic-ui-react';
import {AttributeDetails} from '../../../_gqlTypes/AttributeDetails';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import ConfirmedButton from '../../shared/ConfirmedButton';

interface IUnlinkLibAttributeProps {
    attribute?: AttributeDetails;
    library: GET_LIBRARIES_libraries_list | null;
    onUnlink: (attributesList: string[]) => void;
}

const UnlinkLibAttribute = (props: IUnlinkLibAttributeProps): JSX.Element => {
    const {t} = useTranslation();
    const {attribute, library, onUnlink} = props;

    if (!attribute || !library) {
        return <></>;
    }

    const label = library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

    const action = () => {
        const attributesToSave = !library.attributes
            ? []
            : library.attributes.filter(a => a.id !== attribute.id).map(a => a.id);

        return onUnlink(attributesToSave);
    };

    return (
        <ConfirmedButton action={action} confirmMessage={t('libraries.confirm_unlink_attr', {libLabel: label})}>
            <Button className="unlink" circular icon="cancel" disabled={attribute.system} />
        </ConfirmedButton>
    );
};

export default UnlinkLibAttribute;
