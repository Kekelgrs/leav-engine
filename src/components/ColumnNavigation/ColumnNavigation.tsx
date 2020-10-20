import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';
import CellNavigation from '../CellNavigation';

const Column = styled.div`
    /* box-shadow: 10px 0 10px -2px #888; */
    border-right: 1px solid #888;
    display: flex;
    flex-flow: column nowrap;
`;

interface IColumnNavigationProps {
    treeElements: IRecordAndChildren[];
}

function ColumnNavigation({treeElements}: IColumnNavigationProps): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    return (
        <>
            <Column>
                {treeElements.map(treeElement => (
                    <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={1} />
                ))}
            </Column>

            {stateNavigation.path.map((pathPart, index) => (
                <Column key={pathPart.id}>
                    <ColumnFromPath pathPart={pathPart} treeElements={treeElements} depth={index + 2} />
                </Column>
            ))}
        </>
    );
}

interface IColumnFromPathProps {
    treeElements: IRecordAndChildren[];
    pathPart: {
        id: string;
        library: string;
    };
    depth: number;
}

const ColumnFromPath = ({pathPart, treeElements, depth}: IColumnFromPathProps) => {
    const parent = findPathInTree(pathPart, treeElements);

    if (parent) {
        return (
            <>
                {parent.children?.map(treeElement => (
                    <CellNavigation key={treeElement.record.whoAmI.id} treeElement={treeElement} depth={depth} />
                ))}
            </>
        );
    }

    return <></>;
};

const findPathInTree = (
    pathPart: {
        id: string;
        library: string;
    },
    treeElements: IRecordAndChildren[]
): IRecordAndChildren | any => {
    const parent = treeElements.find(treeElement => {
        return treeElement.record.whoAmI.id === pathPart.id;
    });

    if (parent) {
        return parent;
    }

    const childs = treeElements.reduce((acc, treeElement) => {
        if (treeElement.children && treeElement.children.length) {
            return [...acc, treeElement.children];
        }

        return acc;
    }, [] as IRecordAndChildren[][]);

    for (let child of childs) {
        return findPathInTree(pathPart, child);
    }
};

export default ColumnNavigation;
