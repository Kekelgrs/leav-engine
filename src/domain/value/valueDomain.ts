import {IRecordRepo} from 'infra/record/recordRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import * as moment from 'moment';
import {IQueryInfos} from '../../_types/queryInfos';
import {IValue} from '../../_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {RecordPermissionsActions, AttributePermissionsActions} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import {IAttributePermissionDomain} from '../permission/attributePermissionDomain';

export interface IValueDomain {
    getValues(library: string, recordId: number, attribute: string, options?: any): Promise<IValue[]>;
    saveValue(library: string, recordId: number, attribute: string, value: IValue, infos: IQueryInfos): Promise<IValue>;
    deleteValue(
        library: string,
        recordId: number,
        attribute: string,
        value: IValue,
        infos: IQueryInfos
    ): Promise<IValue>;
}

export default function(
    attributeDomain: IAttributeDomain = null,
    libraryDomain: ILibraryDomain = null,
    valueRepo: IValueRepo = null,
    recordRepo: IRecordRepo = null,
    actionsListDomain: IActionsListDomain = null,
    recordPermissionDomain: IRecordPermissionDomain = null,
    attributePermissionDomain: IAttributePermissionDomain = null
): IValueDomain {
    return {
        async getValues(library: string, recordId: number, attribute: string, options?: any): Promise<IValue[]> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);

            return valueRepo.getValues(library, recordId, attr);
        },
        async saveValue(
            library: string,
            recordId: number,
            attribute: string,
            value: IValue,
            infos: IQueryInfos
        ): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});
            const attrData = await attributeDomain.getAttributeProperties(attribute);
            const valueExists = value.id_value && attrData.type !== AttributeTypes.SIMPLE;

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            // Check permission
            const canUpdateRecord = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT,
                infos.userId,
                library,
                recordId
            );

            if (!canUpdateRecord) {
                throw new PermissionError(RecordPermissionsActions.EDIT);
            }

            const permToCheck = valueExists
                ? AttributePermissionsActions.EDIT_VALUE
                : AttributePermissionsActions.CREATE_VALUE;

            const canSaveValue = await attributePermissionDomain.getAttributePermission(
                permToCheck,
                infos.userId,
                attribute,
                library,
                recordId
            );

            if (!canSaveValue) {
                throw new PermissionError(permToCheck);
            }

            // Check if value ID actually exists
            if (valueExists) {
                const existingVal = await valueRepo.getValueById(library, recordId, attrData, value);

                if (existingVal === null) {
                    throw new ValidationError({id: 'Unknown value'});
                }
            }

            // Execute actions list. Output value might be different from input value
            const actionsListRes =
                !!attrData.actions_list && !!attrData.actions_list.saveValue
                    ? await actionsListDomain.runActionsList(attrData.actions_list.saveValue, value, {
                          attribute: attrData,
                          recordId,
                          library
                      })
                    : value;

            const valueToSave = {
                ...actionsListRes,
                modified_at: moment().unix()
            };

            if (!value.id_value) {
                valueToSave.created_at = moment().unix();
            }

            const savedVal = valueExists
                ? await valueRepo.updateValue(library, recordId, attrData, valueToSave)
                : await valueRepo.createValue(library, recordId, attrData, valueToSave);

            const updatedRecord = await recordRepo.updateRecord(library, {id: recordId, modified_at: moment().unix()});

            return savedVal;
        },
        async deleteValue(
            library: string,
            recordId: number,
            attribute: string,
            value: IValue,
            infos: IQueryInfos
        ): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            // Check permission
            const canUpdateRecord = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT,
                infos.userId,
                library,
                recordId
            );

            if (!canUpdateRecord) {
                throw new PermissionError(RecordPermissionsActions.EDIT);
            }

            const canSaveValue = await attributePermissionDomain.getAttributePermission(
                AttributePermissionsActions.DELETE_VALUE,
                infos.userId,
                attribute,
                library,
                recordId
            );

            if (!canSaveValue) {
                throw new PermissionError(AttributePermissionsActions.DELETE_VALUE);
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);
            // Check if value ID actually exists
            if (value.id_value && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await valueRepo.getValueById(library, recordId, attr, value);

                if (existingVal === null) {
                    throw new ValidationError({id: 'Unknown value'});
                }
            }

            const actionsListRes =
                !!attr.actions_list && !!attr.actions_list.deleteValue
                    ? await actionsListDomain.runActionsList(attr.actions_list.deleteValue, value, {
                          attribute: attr,
                          recordId,
                          library,
                          value
                      })
                    : value;

            return valueRepo.deleteValue(library, recordId, attr, actionsListRes);
        }
    };
}
