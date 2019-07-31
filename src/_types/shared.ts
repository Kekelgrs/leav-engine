import {IAttributeFilterOptions} from './attribute';
import {ILibraryFilterOptions} from './library';
import {IPaginationParams} from './list';
import {ITreeFilterOptions} from './tree';

export interface IGetCoreEntitiesParams {
    filters?: IAttributeFilterOptions | ILibraryFilterOptions | ITreeFilterOptions;
    strictFilters?: boolean;
    withCount?: boolean;
    pagination?: IPaginationParams;
}
