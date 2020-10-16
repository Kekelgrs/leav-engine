import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils} from 'utils/utils';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes, ValueVersionMode} from '../../_types/attribute';
import {Errors, ErrorTypes} from '../../_types/errors';
import {RecordAttributePermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IFindValueTree, IValue, IValuesOptions} from '../../_types/value';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import canSaveValue from './helpers/canSaveValue';
import findValue from './helpers/findValue';
import prepareValue from './helpers/prepareValue';
import saveOneValue from './helpers/saveOneValue';
import updateRecordLastModif from './helpers/updateRecordLastModif';
import validateLibrary from './helpers/validateLibrary';
import validateRecord from './helpers/validateRecord';
import validateValue from './helpers/validateValue';

export interface ISaveBatchValueError {
    type: string;
    message: string;
    input: string;
    attribute: string;
}

export interface ISaveBatchValueResult {
    values: IValue[];
    errors: ISaveBatchValueError[];
}

export interface IValueDomain {
    getValues({
        library,
        recordId,
        attribute,
        options,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: string;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;
    saveValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: string;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Save multiple values independantly (possibly different attributes or versions).
     * If one of the value must not be saved (invalid value or user doesn't have permissions), no value is saved at all
     *
     * keepEmpty If false, empty values will be deleted (or not saved)
     */
    saveValueBatch({
        library,
        recordId,
        values,
        ctx,
        keepEmpty
    }: {
        library: string;
        recordId: string;
        values: IValue[];
        ctx: IQueryInfos;
        keepEmpty?: boolean;
    }): Promise<ISaveBatchValueResult>;
    deleteValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: string;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;
}

interface IDeps {
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.permission.recordAttribute'?: IRecordAttributePermissionDomain;
    'core.domain.permission.record'?: IRecordPermissionDomain;
    'core.infra.record'?: IRecordRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
}

export default function({
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain = null,
    'core.domain.permission.record': recordPermissionDomain = null,
    'core.infra.record': recordRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.value': valueRepo = null,
    'core.utils': utils = null
}: IDeps = {}): IValueDomain {
    return {
        async getValues({library, recordId, attribute, options, ctx}): Promise<IValue[]> {
            await validateLibrary(library, {libraryDomain}, ctx);
            await validateRecord(library, recordId, {recordRepo}, ctx);

            const attr = await attributeDomain.getAttributeProperties({id: attribute, ctx});

            let values: IValue[];
            if (
                !attr.versions_conf ||
                !attr.versions_conf.versionable ||
                attr.versions_conf.mode === ValueVersionMode.SIMPLE
            ) {
                const getValOptions = {
                    ...options,
                    version: attr?.versions_conf?.versionable ? options.version : null
                };

                values = await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: attr,
                    forceGetAllValues: false,
                    options: getValOptions,
                    ctx
                });
            } else {
                // Get all values, no matter the version.
                const allValues: IValue[] = await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: attr,
                    forceGetAllValues: true,
                    options,
                    ctx
                });

                // Get trees ancestors
                const trees: IFindValueTree[] = await Promise.all(
                    attr.versions_conf.trees.map(
                        async (treeName: string): Promise<IFindValueTree> => {
                            const treeElem =
                                options?.version && options.version[treeName]
                                    ? options.version[treeName]
                                    : await treeRepo.getDefaultElement({id: treeName, ctx});

                            const ancestors = await treeRepo.getElementAncestors({
                                treeId: treeName,
                                element: treeElem,
                                ctx
                            });
                            return {
                                name: treeName,
                                currentIndex: 0,
                                elements: ancestors
                            };
                        }
                    )
                );

                // Retrieve appropriate value among all values
                values = findValue(trees, allValues);
            }

            return values;
        },
        async saveValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});

            await validateLibrary(library, {libraryDomain}, ctx);
            await validateRecord(library, recordId, {recordRepo}, ctx);

            const valueChecksParams = {
                attributeProps,
                library,
                recordId,
                value,
                keepEmpty: false,
                infos: ctx
            };

            // Check permissions
            const {canSave, reason: forbiddenPermission, fields} = await canSaveValue({
                ...valueChecksParams,
                ctx,
                deps: {
                    recordPermissionDomain,
                    recordAttributePermissionDomain
                }
            });

            if (!canSave) {
                throw new PermissionError(forbiddenPermission, fields);
            }

            // Validate value
            const validationErrors = await validateValue({
                ...valueChecksParams,
                deps: {
                    attributeDomain,
                    recordRepo,
                    valueRepo,
                    treeRepo
                },
                ctx
            });

            if (Object.keys(validationErrors).length) {
                throw new ValidationError<IValue>(validationErrors);
            }

            // Prepare value
            const valueToSave = await prepareValue({
                ...valueChecksParams,
                deps: {
                    actionsListDomain,
                    attributeDomain,
                    utils
                },
                ctx
            });

            const savedVal = await saveOneValue(
                library,
                recordId,
                attributeProps,
                valueToSave,
                {
                    valueRepo,
                    recordRepo
                },
                ctx
            );

            await updateRecordLastModif(library, recordId, {recordRepo}, ctx);

            return savedVal;
        },
        async saveValueBatch({library, recordId, values, ctx, keepEmpty = false}): Promise<ISaveBatchValueResult> {
            await validateLibrary(library, {libraryDomain}, ctx);
            await validateRecord(library, recordId, {recordRepo}, ctx);

            const saveRes: ISaveBatchValueResult = await values.reduce(
                async (promPrevRes: Promise<ISaveBatchValueResult>, value: IValue): Promise<ISaveBatchValueResult> => {
                    const prevRes = await promPrevRes;
                    try {
                        const attributeProps = await attributeDomain.getAttributeProperties({id: value.attribute, ctx});

                        const valueChecksParams = {
                            attributeProps,
                            library,
                            recordId,
                            value,
                            keepEmpty
                        };

                        // Check permissions
                        const {canSave, reason: forbiddenPermission} = await canSaveValue({
                            ...valueChecksParams,
                            ctx,
                            deps: {
                                recordPermissionDomain,
                                recordAttributePermissionDomain
                            }
                        });

                        if (!canSave) {
                            throw new PermissionError(forbiddenPermission);
                        }

                        // Validate value
                        const validationErrors = await validateValue({
                            ...valueChecksParams,
                            deps: {
                                attributeDomain,
                                recordRepo,
                                valueRepo,
                                treeRepo
                            },
                            ctx
                        });

                        if (Object.keys(validationErrors).length) {
                            throw new ValidationError<IValue>(validationErrors);
                        }

                        // Prepare value
                        const valToSave = await prepareValue({
                            ...valueChecksParams,
                            deps: {
                                actionsListDomain,
                                attributeDomain,
                                utils
                            },
                            ctx
                        });

                        const savedVal =
                            !keepEmpty && !valToSave.value && valToSave.id_value
                                ? await valueRepo.deleteValue({
                                      library,
                                      recordId,
                                      attribute: attributeProps,
                                      value: valToSave,
                                      ctx
                                  })
                                : await saveOneValue(
                                      library,
                                      recordId,
                                      attributeProps,
                                      valToSave,
                                      {
                                          valueRepo,
                                          recordRepo
                                      },
                                      ctx
                                  );

                        prevRes.values.push({...savedVal, attribute: value.attribute});
                    } catch (e) {
                        if (
                            !e.type ||
                            (e.type !== ErrorTypes.VALIDATION_ERROR && e.type !== ErrorTypes.PERMISSION_ERROR)
                        ) {
                            utils.rethrow(e);
                        }

                        if (!Array.isArray(prevRes.errors)) {
                            prevRes.errors = [];
                        }

                        prevRes.errors.push({
                            type: e.type,
                            message: e.fields && e.fields[value.attribute] ? e.fields[value.attribute] : e.message,
                            input: value.value,
                            attribute: value.attribute
                        });
                    }

                    return prevRes;
                },
                Promise.resolve({values: [], errors: null})
            );

            if (saveRes.values.length) {
                await updateRecordLastModif(library, recordId, {recordRepo}, ctx);
            }

            return saveRes;
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            await validateLibrary(library, {libraryDomain}, ctx);
            await validateRecord(library, recordId, {recordRepo}, ctx);

            // Check permission
            const canUpdateRecord = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT_RECORD,
                ctx.userId,
                library,
                recordId,
                ctx
            );

            if (!canUpdateRecord) {
                throw new PermissionError(RecordPermissionsActions.EDIT_RECORD);
            }

            const isAllowedToDelete = await recordAttributePermissionDomain.getRecordAttributePermission(
                RecordAttributePermissionsActions.DELETE_VALUE,
                ctx.userId,
                attribute,
                library,
                recordId,
                ctx
            );

            if (!isAllowedToDelete) {
                throw new PermissionError(RecordAttributePermissionsActions.DELETE_VALUE);
            }

            const attr = await attributeDomain.getAttributeProperties({id: attribute, ctx});
            // Check if value ID actually exists
            if (value.id_value && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await valueRepo.getValueById({library, recordId, attribute: attr, value, ctx});

                if (existingVal === null) {
                    throw new ValidationError({id: Errors.UNKNOWN_VALUE});
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

            const res = await valueRepo.deleteValue({library, recordId, attribute: attr, value: actionsListRes, ctx});
            // Make sure attribute is returned here
            res.attribute = attribute;

            return res;
        }
    };
}
