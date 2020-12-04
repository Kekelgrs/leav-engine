// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetAppPermissionParams, IGetHeritedAppPermissionParams} from './_types';

export interface IAppPermissionDomain {
    getAppPermission({action, userId, ctx}: IGetAppPermissionParams): Promise<boolean>;
    getHeritedAppPermission({action, userGroupId, ctx}: IGetHeritedAppPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission'?: IGlobalPermissionHelper;
}

export default function({
    'core.domain.permission.helpers.globalPermission': globalPermHelper = null
}: IDeps = {}): IAppPermissionDomain {
    const getAppPermission = async ({action, userId, ctx}: IGetAppPermissionParams): Promise<boolean> => {
        return globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.APP,
                action,
                userId
            },
            ctx
        );
    };

    const getHeritedAppPermission = async ({
        action,
        userGroupId,
        ctx
    }: IGetHeritedAppPermissionParams): Promise<boolean> => {
        return globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.APP,
                action,
                userGroupId
            },
            ctx
        );
    };

    return {
        getAppPermission,
        getHeritedAppPermission
    };
}
