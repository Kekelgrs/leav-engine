import {shallow} from 'enzyme';
import * as React from 'react';
import TreeStructureView from './TreeStructureView';

describe('TreeStructureView', () => {
    test('Render loading if no data', async () => {
        const onTreeChange = jest.fn();
        const onVisibilityToggle = jest.fn();
        const onMoveNode = jest.fn();
        const onDeleteNode = jest.fn();

        const comp = shallow(
            <TreeStructureView
                readOnly={false}
                treeData={[]}
                onTreeChange={onTreeChange}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={onMoveNode}
                onDeleteNode={onDeleteNode}
            />
        );

        expect(comp.find('Loading')).toHaveLength(1);
        expect(comp.find('SortableTree')).toHaveLength(0);
    });

    test('Render tree', async () => {
        const onTreeChange = jest.fn();
        const onVisibilityToggle = jest.fn();
        const onMoveNode = jest.fn();
        const onDeleteNode = jest.fn();

        const comp = shallow(
            <TreeStructureView
                readOnly={false}
                treeData={[{id: 1234, library: {id: 'test_lib'}}]}
                onTreeChange={onTreeChange}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={onMoveNode}
                onDeleteNode={onDeleteNode}
            />
        );

        expect(comp.find('Loading')).toHaveLength(0);
        expect(comp.find('DragDropContext(ReactSortableTree)')).toHaveLength(1);
    });
});
