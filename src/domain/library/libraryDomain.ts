import {ILibraryRepo} from 'infra/library/libraryRepo';
import {difference} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IList, IPaginationParams} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ILibrary, ILibraryFilterOptions} from '../../_types/library';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from '../permission/permissionDomain';

export interface ILibraryDomain {
    getLibraries(
        filters?: ILibraryFilterOptions,
        withCount?: boolean,
        pagination?: IPaginationParams
    ): Promise<IList<ILibrary>>;
    saveLibrary(library: ILibrary, infos: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, infos: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string): Promise<ILibrary>;
    getLibraryAttributes(id: string): Promise<IAttribute[]>;
}

export default function(
    libraryRepo: ILibraryRepo,
    attributeDomain: IAttributeDomain = null,
    permissionDomain: IPermissionDomain = null,
    utils: IUtils = null
): ILibraryDomain {
    return {
        async getLibraries(
            filters?: ILibraryFilterOptions,
            withCount: boolean = false,
            pagination?: IPaginationParams
        ): Promise<IList<ILibrary>> {
            const libsList = await libraryRepo.getLibraries(filters, false, withCount, pagination);

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
                throw new ValidationError({id: 'Missing library ID'});
            }

            const libs = await libraryRepo.getLibraries({id});

            if (!libs.list.length) {
                throw new ValidationError({id: 'Unknown library ' + id});
            }

            const props = libs.list.pop();

            return props;
        },
        async getLibraryAttributes(id: string): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({id});

            if (!libs.list.length) {
                throw new ValidationError({id: 'Unknown library ' + id});
            }

            return libraryRepo.getLibraryAttributes(id);
        },
        async saveLibrary(libData: ILibrary, infos: IQueryInfos): Promise<ILibrary> {
            const dataToSave = {...libData};
            const libs = await libraryRepo.getLibraries({id: dataToSave.id});
            const existingLib = !!libs.list.length;
            const errors = {} as any;

            // Check permissions
            const action = existingLib ? AdminPermissionsActions.EDIT_LIBRARY : AdminPermissionsActions.CREATE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: 'Invalid ID format: ' + dataToSave.id});
            }

            if (dataToSave.permissions_conf) {
                const availableTreeAttributes = await attributeDomain.getAttributes();
                const unknownTreeAttributes = difference(
                    dataToSave.permissions_conf.permissionTreeAttributes,
                    availableTreeAttributes.list.map(treeAttr => treeAttr.id)
                );

                if (unknownTreeAttributes.length) {
                    errors.permissions_conf = `Unknown tree attributes: ${unknownTreeAttributes.join(', ')}`;
                }
            }

            // New library? Link default attributes. Otherwise, save given attributes if any
            const libAttributes = existingLib
                ? typeof dataToSave.attributes !== 'undefined'
                    ? dataToSave.attributes.map(attr => attr.id)
                    : null
                : ['id', 'created_at', 'created_by', 'modified_at', 'modified_by'];

            if (libAttributes !== null) {
                const availableAttributes = await attributeDomain.getAttributes();
                const unknownAttrs = difference(libAttributes, availableAttributes.list.map(attr => attr.id));

                if (unknownAttrs.length) {
                    errors.attributes = `Unknown attributes: ${unknownAttrs.join(', ')}`;
                } else {
                    await libraryRepo.saveLibraryAttributes(dataToSave.id, libAttributes);
                }
            }

            if (dataToSave.recordIdentityConf) {
                const allowedAttributes =
                    libAttributes || (await libraryRepo.getLibraryAttributes(dataToSave.id)).map(a => a.id);

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
                    errors.recordIdentityConf = `Attributes must be binded to library: ${unbindedAttrs.join(', ')}`;
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const lib = existingLib
                ? await libraryRepo.updateLibrary(dataToSave)
                : await libraryRepo.createLibrary(dataToSave);

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
            const lib = await this.getLibraries({id});

            // Check if exists and can delete
            if (!lib.list.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            if (lib.list.pop().system) {
                throw new ValidationError({id: 'Cannot delete system library'});
            }

            return libraryRepo.deleteLibrary(id);
        }
    };
}
