import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Icon, Table} from 'semantic-ui-react';
import {GET_PERMISSIONS_heritPerm, GET_PERMISSIONS_perm} from 'src/_gqlTypes/GET_PERMISSIONS';
import {SAVE_PERMISSION_savePermission_actions} from 'src/_gqlTypes/SAVE_PERMISSION';
import styled from 'styled-components';
import PermissionSelector from '../PermissionSelector';

interface IEditPermissionsViewProps extends WithNamespaces {
    permissions: GET_PERMISSIONS_perm[];
    heritedPermissions: GET_PERMISSIONS_heritPerm[];
    onChange: (permToSave: SAVE_PERMISSION_savePermission_actions) => void;
}

const permissionForbiddenColor = '#FF0000';
const permissionAllowedColor = '#99cc00';

/* tslint:disable-next-line:variable-name */
const ForbiddenIcon = styled(Icon)`
    color: ${permissionForbiddenColor};
`;

/* tslint:disable-next-line:variable-name */
const AllowedIcon = styled(Icon)`
    color: ${permissionAllowedColor};
`;

/* tslint:disable-next-line:variable-name */
const PermissionsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

function EditPermissionsView({permissions, heritedPermissions, onChange, t}: IEditPermissionsViewProps): JSX.Element {
    const heritPermByName = heritedPermissions.reduce((heritPerms, p) => {
        heritPerms[p.name] = p.allowed;

        return heritPerms;
    }, {});

    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{t('permissions.permission_col_name')}</Table.HeaderCell>
                    <Table.HeaderCell>
                        <PermissionsHeader>
                            <ForbiddenIcon name="ban" />
                            <Icon name="sitemap" />
                            <AllowedIcon name="checkmark" />
                        </PermissionsHeader>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {permissions.map(p => {
                    if (!p) {
                        return;
                    }

                    const _onPermUpdate = (permVal: boolean | null) => onChange({name: p.name, allowed: permVal});

                    return (
                        <Table.Row key={p.name}>
                            <Table.Cell>
                                <p>{t('permissions.' + p.name)}</p>
                            </Table.Cell>
                            <PermissionSelector
                                as={Table.Cell}
                                value={p.allowed}
                                heritValue={heritPermByName[p.name]}
                                onChange={_onPermUpdate}
                                forbiddenColor={permissionForbiddenColor}
                                allowedColor={permissionAllowedColor}
                            />
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
}

export default withNamespaces()(EditPermissionsView);
