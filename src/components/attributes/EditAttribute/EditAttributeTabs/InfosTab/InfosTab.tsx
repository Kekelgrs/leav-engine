// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useMutation} from '@apollo/react-hooks';
import {History} from 'history';
import React from 'react';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {clearCacheQueriesFromRegexp} from '../../../../../utils';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list,
    GET_ATTRIBUTES_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_attributes_list_TreeAttribute
} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import {IFormError} from '../../../../../_types/errors';
import {onAttributePostSaveFunc} from '../../EditAttribute';
import InfosForm from './InfosForm';
// import useLang from '../../../../../hooks/useLang';

interface IInfosTabProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    onPostSave?: onAttributePostSaveFunc;
    forcedType?: AttributeType;
    history?: History;
}

function InfosTab({attribute, onPostSave, forcedType, history}: IInfosTabProps): JSX.Element {
    // const {lang} = useLang();
    const [saveAttribute, {error}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined,
        update: async (cache, {data: dataCached}) => {
            const newAttribute = dataCached!.saveAttribute;
            const cachedData: any = cache.readQuery({query: getAttributesQuery, variables: {id: newAttribute.id}});

            clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.attributes/);

            const newAttributes = {
                totalCount: 1,
                list: [newAttribute],
                __typename: cachedData.attributes.__typename
            };

            cache.writeQuery({
                query: getAttributesQuery,
                data: {attributes: newAttributes},
                variables: {id: newAttribute.id}
            });

            if (history) {
                history.replace({pathname: '/attributes/edit/' + newAttribute.id});
            }
        }
    });

    const [getAttrById, {data: dataAttrById}] = useLazyQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(
        getAttributesQuery
    );

    const _isIdUnique = async val => {
        await getAttrById({variables: {id: val}});

        return !!dataAttrById && !!dataAttrById.attributes && !dataAttrById.attributes.list.length;
    };

    const onSubmitInfos = async (dataToSave: GET_ATTRIBUTES_attributes_list) => {
        const variables = {
            attrData: {
                id: dataToSave.id,
                label: {
                    fr: dataToSave.label?.fr ?? '',
                    en: dataToSave.label?.en ?? ''
                },
                type: dataToSave.type,
                format: dataToSave.format,
                linked_tree: (dataToSave as GET_ATTRIBUTES_attributes_list_TreeAttribute).linked_tree?.id,
                linked_library: (dataToSave as GET_ATTRIBUTES_attributes_list_LinkAttribute).linked_library?.id,
                multiple_values: dataToSave.multiple_values,
                versions_conf: {
                    versionable: dataToSave.versions_conf ? dataToSave.versions_conf.versionable : false,
                    mode: dataToSave.versions_conf ? dataToSave.versions_conf.mode : null,
                    trees: dataToSave.versions_conf ? dataToSave.versions_conf.trees : null
                }
            }
        };
        console.log(variables);
        await saveAttribute({
            variables
        });

        if (onPostSave) {
            onPostSave(dataToSave);
        }
    };

    const formErrors = error && error.graphQLErrors.length ? error.graphQLErrors[0] : null;

    return (
        <InfosForm
            onSubmitInfos={onSubmitInfos}
            errors={(formErrors as unknown) as IFormError}
            attribute={attribute || null}
            readonly={false}
            onCheckIdExists={_isIdUnique}
            forcedType={forcedType}
        />
    );
}

export default InfosTab;
