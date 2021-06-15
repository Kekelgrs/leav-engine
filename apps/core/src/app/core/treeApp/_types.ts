// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibrary} from '_types/library';
import {IPaginationParams, ISortParams} from '_types/list';
import {ITreePermissionsConf} from '_types/permissions';
import {ITree, ITreeLibrarySettings, ITreeFilterOptions} from '_types/tree';

export interface ITreeLibraryForGraphQL {
    library: ILibrary;
    settings: ITreeLibrarySettings;
}

export interface ITreeLibraryInputFromGraphQL {
    library: string;
    settings: ITreeLibrarySettings;
}

export interface ITreePermissionsConfForGraphQL {
    libraryId: string;
    permissionsConf: ITreePermissionsConf;
}

export type TreeFromGraphQL = Omit<ITree, 'libraries' | 'permissions_conf'> & {
    permissions_conf: [{libraryId: string; permissionsConf: ITreePermissionsConf}];
    libraries: [ITreeLibraryInputFromGraphQL];
};

export interface ITreesQueryArgs {
    filters: ITreeFilterOptions;
    pagination: IPaginationParams;
    sort: ISortParams;
}

export interface ISaveTreeMutationArgs {
    tree: TreeFromGraphQL;
}
