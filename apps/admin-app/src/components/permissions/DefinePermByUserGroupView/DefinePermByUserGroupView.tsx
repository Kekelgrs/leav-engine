// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {NodeData, TreeNode} from 'react-sortable-tree';
import {getTreeNodeKey} from '../../../utils/utils';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../shared/ColumnsDisplay';
import DefinePermissionsViewLoadTree from '../DefinePermissionsViewLoadTree';
import EditPermissions from '../EditPermissions';

interface IDefinePermByUserGroupViewProps {
    applyTo?: string;
    readOnly?: boolean;
    type: PermissionTypes;
}

function DefinePermByUserGroupView({applyTo, readOnly, type}: IDefinePermByUserGroupViewProps): JSX.Element {
    const usersGroupsTreeId = 'users_groups';

    const [selectedGroupNode, setSelectedGroupNode] = React.useState<NodeData | null>(null);

    const _selectGroupNode = (nodeData: NodeData) =>
        setSelectedGroupNode(
            getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedGroupNode as TreeNode) ? nodeData : null
        );

    const cols = [
        <DefinePermissionsViewLoadTree
            key="users_groups"
            treeId={usersGroupsTreeId}
            onClick={_selectGroupNode}
            selectedNode={selectedGroupNode}
        />
    ];

    if (selectedGroupNode) {
        cols.push(
            <EditPermissions
                permParams={{
                    type,
                    applyTo,
                    usersGroup: selectedGroupNode.node.id !== 'root' ? selectedGroupNode.node.id : null
                }}
                readOnly={readOnly}
            />
        );
    }

    return <ColumnsDisplay columnsNumber={2} columnsContent={cols} />;
}

export default DefinePermByUserGroupView;
