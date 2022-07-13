// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IViewRepo} from 'infra/view/_types';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {ICachesService} from '../../infra/cache/cacheService';

interface IDeps {
    'core.infra.library'?: ILibraryRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.view'?: IViewRepo;
    'core.infra.cache.cacheService'?: ICachesService;
    'core.utils'?: IUtils;
}

export type GetCoreEntityByIdFunc = <T extends ICoreEntity>(
    entityType: 'library' | 'attribute' | 'tree' | 'view',
    entityId: string,
    ctx: IQueryInfos
) => Promise<T>;

export default function ({
    'core.infra.library': libraryRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.view': viewRepo = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.utils': utils = null
}: IDeps): GetCoreEntityByIdFunc {
    const getCoreEntityById = async function <T>(entityType, entityId, ctx): Promise<T> {
        const _execute = async () => {
            let result;
            switch (entityType) {
                case 'library':
                    result = await libraryRepo.getLibraries({
                        params: {filters: {id: entityId}, strictFilters: true},
                        ctx
                    });
                    break;
                case 'attribute':
                    result = await attributeRepo.getAttributes({
                        params: {filters: {id: entityId}, strictFilters: true},
                        ctx
                    });
                    break;
                case 'tree':
                    result = await treeRepo.getTrees({params: {filters: {id: entityId}, strictFilters: true}, ctx});
                    break;
                case 'view':
                    result = await viewRepo.getViews({filters: {id: entityId}, strictFilters: true}, ctx);
                    break;
            }

            if (!result.list.length) {
                return null;
            }

            return result.list[0];
        };

        const cacheKey = utils.getCoreEntityCacheKey(entityType, entityId);

        // Due to race conditions, we sometimes get null when retrieving a newly created core entity. Thus, we don't
        // want to keep this "false" null in cache
        const res = await cacheService.memoize({key: cacheKey, func: _execute, storeNulls: false, ctx});
        return res;
    };

    return getCoreEntityById;
}
