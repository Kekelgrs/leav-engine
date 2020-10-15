import {IAttributePermissionDomain} from 'domain/permission/attributePermissionDomain';
import {IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {AttributePermissionsActions, RecordPermissionsActions} from '../../../_types/permissions';
import doesValueExist from './doesValueExist';

interface ICanSaveValueRes {
    canSave: boolean;
    reason?: AttributePermissionsActions | RecordPermissionsActions;
    fields?: ErrorFieldDetail<IValue>;
}

interface ICanSaveValueParams {
    attributeProps: IAttribute;
    value: IValue;
    library: string;
    recordId: string;
    ctx?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        recordPermissionDomain: IRecordPermissionDomain;
        attributePermissionDomain: IAttributePermissionDomain;
    };
}

const _canSaveMetadata = async (
    valueExists: boolean,
    library: string,
    recordId: string,
    value: IValue,
    ctx: IQueryInfos,
    deps: {attributePermissionDomain: IAttributePermissionDomain}
): Promise<{canSave: boolean; fields?: ErrorFieldDetail<IValue>; reason?: AttributePermissionsActions}> => {
    const permToCheck = valueExists ? AttributePermissionsActions.EDIT_VALUE : AttributePermissionsActions.CREATE_VALUE;
    const errors: string[] = await Object.keys(value.metadata).reduce(async (allErrorsProm, field) => {
        const allErrors = await allErrorsProm;

        const canUpdateField = await deps.attributePermissionDomain.getAttributePermission(
            permToCheck,
            ctx.userId,
            field,
            library,
            recordId,
            ctx
        );

        if (!canUpdateField) {
            allErrors.push(field);
        }

        return allErrors;
    }, Promise.resolve([]));

    if (!errors.length) {
        return {canSave: true};
    }

    return {
        canSave: false,
        fields: {metadata: {msg: Errors.METADATA_PERMISSION_ERROR, vars: {fields: errors.join(', ')}}},
        reason: permToCheck
    };
};

export default async (params: ICanSaveValueParams): Promise<ICanSaveValueRes> => {
    const {attributeProps, value, library, recordId, ctx, deps, keepEmpty = false} = params;
    const valueExists = doesValueExist(value, attributeProps);

    // Check permission
    const canUpdateRecord = await deps.recordPermissionDomain.getRecordPermission(
        RecordPermissionsActions.EDIT_RECORD,
        ctx.userId,
        library,
        recordId,
        ctx
    );

    if (!canUpdateRecord) {
        return {canSave: false, reason: RecordPermissionsActions.EDIT_RECORD};
    }

    const permToCheck =
        !keepEmpty && !value.value
            ? AttributePermissionsActions.DELETE_VALUE
            : valueExists
            ? AttributePermissionsActions.EDIT_VALUE
            : AttributePermissionsActions.CREATE_VALUE;

    const isAllowed = await deps.attributePermissionDomain.getAttributePermission(
        permToCheck,
        ctx.userId,
        attributeProps.id,
        library,
        recordId,
        ctx
    );

    if (!isAllowed) {
        return {canSave: false, reason: permToCheck};
    }

    // Check metadata permissions
    if (value.metadata) {
        return _canSaveMetadata(valueExists, library, recordId, value, ctx, {
            attributePermissionDomain: deps.attributePermissionDomain
        });
    }

    return {canSave: true};
};
