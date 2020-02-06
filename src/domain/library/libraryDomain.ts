import {i18n} from 'i18next';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {difference, union} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ILibrary} from '../../_types/library';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from '../permission/permissionDomain';

export interface ILibraryDomain {
    getLibraries(params?: IGetCoreEntitiesParams): Promise<IList<ILibrary>>;
    saveLibrary(library: ILibrary, infos: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string): Promise<ILibrary>;
    getLibraryAttributes(id: string): Promise<IAttribute[]>;
}

interface IDeps {
    'core.infra.library'?: ILibraryRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.utils'?: IUtils;
    translator?: i18n;
    // 'core.domain.translator'?: ITranslatorDomain;
}

export default function({
    'core.infra.library': libraryRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.utils': utils = null,
    translator: translator
}: // 'core.domain.translator': t = null
IDeps = {}): ILibraryDomain {
    return {
        async getLibraries(params?: IGetCoreEntitiesParams): Promise<IList<ILibrary>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            const libsList = await libraryRepo.getLibraries(initializedParams);

            const libs = await Promise.all(
                libsList.list.map(async lib => {
                    lib.attributes = await libraryRepo.getLibraryAttributes(lib.id);

                    return lib;
                })
            );

            return {
                totalCount: libsList.totalCount,
                list: libs
            };
        },
        async getLibraryProperties(id: string): Promise<ILibrary> {
            if (!id) {
                throw new ValidationError({id: Errors.MISSING_LIBRARY_ID});
            }

            const libs = await libraryRepo.getLibraries({filters: {id}, strictFilters: true});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const props = libs.list.pop();

            return props;
        },
        async getLibraryAttributes(id: string): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({filters: {id}});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            return libraryRepo.getLibraryAttributes(id);
        },
        async saveLibrary(libData: ILibrary, infos: IQueryInfos): Promise<ILibrary> {
            const dataToSave = {...libData};
            const libs = await libraryRepo.getLibraries({filters: {id: dataToSave.id}});
            const existingLib = !!libs.list.length;
            const errors = {} as any;
            const defaultAttributes = ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

            // Check permissions
            const action = existingLib ? AdminPermissionsActions.EDIT_LIBRARY : AdminPermissionsActions.CREATE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            if (dataToSave.permissions_conf) {
                const availableTreeAttributes = await attributeDomain.getAttributes();
                const unknownTreeAttributes = difference(
                    dataToSave.permissions_conf.permissionTreeAttributes,
                    availableTreeAttributes.list.map(treeAttr => treeAttr.id)
                );

                if (unknownTreeAttributes.length) {
                    errors.permissions_conf = {
                        msg: Errors.UNKNOWN_ATTRIBUTES,
                        vars: {attributes: unknownTreeAttributes.join(', ')}
                    };
                }
            }

            // New library? Link default attributes. Otherwise, save given attributes if any
            const attributesToSave =
                typeof dataToSave.attributes !== 'undefined' ? dataToSave.attributes.map(attr => attr.id) : [];

            const libAttributes = existingLib ? attributesToSave : union(defaultAttributes, attributesToSave);

            if (libAttributes.length) {
                const availableAttributes = await attributeDomain.getAttributes();
                const unknownAttrs = difference(
                    libAttributes,
                    availableAttributes.list.map(attr => attr.id)
                );

                if (unknownAttrs.length) {
                    errors.attributes = {
                        msg: Errors.UNKNOWN_ATTRIBUTES,
                        vars: {attributes: unknownAttrs.join(', ')}
                    };
                }
            }

            if (dataToSave.recordIdentityConf) {
                const allowedAttributes = libAttributes.length
                    ? libAttributes
                    : (await libraryRepo.getLibraryAttributes(dataToSave.id)).map(a => a.id);

                const unbindedAttrs = [];
                for (const identitiyField of Object.keys(dataToSave.recordIdentityConf)) {
                    const attrId = dataToSave.recordIdentityConf[identitiyField];
                    if (!attrId) {
                        dataToSave.recordIdentityConf[identitiyField] = null;
                        continue;
                    }

                    if (allowedAttributes.indexOf(attrId) === -1) {
                        unbindedAttrs.push(attrId);
                    }
                }

                if (unbindedAttrs.length) {
                    errors.recordIdentityConf = {
                        msg: Errors.UNBINDED_ATTRIBUTES,
                        vars: {attributes: unbindedAttrs.join(', ')}
                    };
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const lib = existingLib
                ? await libraryRepo.updateLibrary(dataToSave)
                : await libraryRepo.createLibrary(dataToSave);

            if (libAttributes.length) {
                await libraryRepo.saveLibraryAttributes(dataToSave.id, libAttributes);
            }

            return lib;
        },
        async deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary> {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            // Get library
            const lib = await this.getLibraries({filters: {id}});

            // Check if exists and can delete
            if (!lib.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            if (lib.list.pop().system) {
                throw new ValidationError({id: Errors.SYSTEM_LIBRARY_DELETION});
            }

            return libraryRepo.deleteLibrary(id);
        }
    };
}
