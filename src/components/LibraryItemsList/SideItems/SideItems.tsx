import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import {TypeSideItem} from '../../../_types/types';
import Filters from '../Filters';
import ViewPanel from '../ViewPanel';

interface WrapperFilterProps {
    visible: boolean;
    style?: CSSObject;
}

const WrapperFilter = styled.div<WrapperFilterProps>`
    display: ${({visible}) => (visible ? 'flex' : 'none')};
    position: relative;
    height: 100vh;
    margin-right: 16px;
    animation: ${({visible}) => (visible ? 'slide-in 250ms ease' : 'none')};

    @keyframes slide-in {
        from {
            transform: translateX(-20rem);
        }
        to {
            transform: translateX(0rem);
        }
    }
`;

function SideItems(): JSX.Element {
    const {stateItems} = useStateItem();

    return (
        <WrapperFilter
            visible={stateItems.sideItems.visible}
            className={stateItems.sideItems.visible ? 'wrapped-filter-open' : 'wrapped-filter-close'}
        >
            {stateItems.sideItems.visible && stateItems.sideItems.type === TypeSideItem.filters && <Filters />}
            {stateItems.sideItems.visible && stateItems.sideItems.type === TypeSideItem.view && <ViewPanel />}
        </WrapperFilter>
    );
}

export default SideItems;
