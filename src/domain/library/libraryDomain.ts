import {i18n} from 'i18next';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {omit, union} from 'lodash';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {ErrorFieldDetail} from '_types/errors';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import getDefaultAttributes from '../../utils/helpers/getLibraryDefaultAttributes';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IList, SortOrder} from '../../_types/list';
import {AppPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import checkSavePermission from './helpers/checkSavePermission';
import runBehaviorPostDelete from './helpers/runBehaviorPostDelete';
import runBehaviorPostSave from './helpers/runBehaviorPostSave';
import validateLibAttributes from './helpers/validateLibAttributes';
import validatePermConf from './helpers/validatePermConf';
import validateRecordIdentityConf from './helpers/validateRecordIdentityConf';

export interface ILibraryDomain {
    getLibraries({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ILibrary>>;
    saveLibrary(library: ILibrary, ctx: IQueryInfos): Promise<ILibrary>;
    deleteLibrary(id: string, ctx: IQueryInfos): Promise<ILibrary>;
    getLibraryProperties(id: string, ctx: IQueryInfos): Promise<ILibrary>;
    getLibraryAttributes(id: string, ctx: IQueryInfos): Promise<IAttribute[]>;
}

interface IDeps {
    'core.infra.library'?: ILibraryRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.utils'?: IUtils;
    translator?: i18n;
    'core.infra.tree'?: ITreeRepo;
}

export default function({
    'core.infra.library': libraryRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null,
    translator: translator
}: IDeps = {}): ILibraryDomain {
    return {
        async getLibraries({params, ctx}): Promise<IList<ILibrary>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            const libsList = await libraryRepo.getLibraries({params: initializedParams, ctx});

            const libs = await Promise.all(
                libsList.list.map(async lib => {
                    lib.attributes = await libraryRepo.getLibraryAttributes({libId: lib.id, ctx});

                    return lib;
                })
            );

            return {
                totalCount: libsList.totalCount,
                list: libs
            };
        },
        async getLibraryProperties(id: string, ctx): Promise<ILibrary> {
            if (!id) {
                throw new ValidationError({id: Errors.MISSING_LIBRARY_ID});
            }

            const libs = await libraryRepo.getLibraries({
                params: {filters: {id}, strictFilters: true},
                ctx
            });

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const props = libs.list.pop();

            return props;
        },
        async getLibraryAttributes(id: string, ctx): Promise<IAttribute[]> {
            const libs = await libraryRepo.getLibraries({params: {filters: {id}}, ctx});

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            return libraryRepo.getLibraryAttributes({libId: id, ctx});
        },
        async saveLibrary(libData: ILibrary, ctx: IQueryInfos): Promise<ILibrary> {
            const libs = await libraryRepo.getLibraries({params: {filters: {id: libData.id}}, ctx});
            const existingLib = !!libs.list.length;
            const errors = {} as any;
            const defaultParams = {
                id: '',
                system: false,
                behavior: LibraryBehavior.STANDARD,
                label: {fr: '', en: ''}
            };

            // If existing lib, skip all uneditable fields from supplied params.
            // If new lib, merge default params with supplied params
            const uneditableFields = ['behavior', 'system'];
            const dataToSave = existingLib ? omit(libData, uneditableFields) : {...defaultParams, ...libData};

            const validationErrors: Array<ErrorFieldDetail<ILibrary>> = [];
            const defaultAttributes = getDefaultAttributes(dataToSave.behavior);

            // Check permissions
            const permCheck = await checkSavePermission(existingLib, ctx.userId, {permissionDomain}, ctx);
            if (!permCheck.canSave) {
                throw new PermissionError(permCheck.action);
            }

            // Validate ID format
            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            validationErrors.push(await validatePermConf(dataToSave.permissions_conf, {attributeDomain}, ctx));

            // New library? Link default attributes. Otherwise, save given attributes if any
            const attributesToSave =
                typeof dataToSave.attributes !== 'undefined' ? dataToSave.attributes.map(attr => attr.id) : [];

            const libAttributes = existingLib ? attributesToSave : union(defaultAttributes, attributesToSave);

            // We can get rid of attributes in lib data, it will be saved separately
            delete dataToSave.attributes;

            validationErrors.push(
                await validateLibAttributes(libAttributes, {attributeDomain}, ctx),
                await validateRecordIdentityConf(
                    dataToSave as ILibrary,
                    libAttributes,
                    {
                        attributeDomain,
                        libraryRepo
                    },
                    ctx
                )
            );

            const mergedValidationErrors = validationErrors.reduce((acc, cur) => ({...acc, ...cur}), {});
            if (Object.keys(mergedValidationErrors).length) {
                throw new ValidationError(mergedValidationErrors);
            }

            const lib = existingLib
                ? await libraryRepo.updateLibrary({
                      libData: dataToSave as ILibrary,
                      ctx
                  })
                : await libraryRepo.createLibrary({
                      libData: dataToSave as ILibrary,
                      ctx
                  });

            if (libAttributes.length) {
                await libraryRepo.saveLibraryAttributes({
                    libId: dataToSave.id,
                    attributes: libAttributes,
                    ctx
                });
            }

            await runBehaviorPostSave(lib, !existingLib, {treeRepo, utils}, ctx);

            return lib;
        },
        async deleteLibrary(id: string, ctx: IQueryInfos): Promise<ILibrary> {
            // Check permissions
            const action = AppPermissionsActions.DELETE_LIBRARY;
            const canSaveLibrary = await permissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSaveLibrary) {
                throw new PermissionError(action);
            }

            // Get library
            const libraries = await this.getLibraries({params: {filters: {id}}, ctx});

            if (!libraries.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const lib = libraries.list[0];
            if (lib.system) {
                throw new ValidationError({id: Errors.SYSTEM_LIBRARY_DELETION});
            }

            await runBehaviorPostDelete(lib, {treeRepo, utils}, ctx);

            return libraryRepo.deleteLibrary({id, ctx});
        }
    };
}
