// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {HeartOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconCross} from '../../../../../assets/icons/IconCross';
import themingVar from '../../../../../themingVar';
import {IRecordIdentityWhoAmI, PreviewSize} from '../../../../../_types/types';

const Info = styled.div`
    border-left: 1px solid ${themingVar['@divider-color']};
`;

interface ICellInfosProps {
    record: IRecordIdentityWhoAmI;
    previewSize: PreviewSize;
    lang?: string[];
}

function CellInfos({record, previewSize, lang}: ICellInfosProps): JSX.Element {
    const {t} = useTranslation();

    const menuBtnSize: SizeType = 'middle';
    const moreActions = [
        {
            title: t('items_list.table.actions-tooltips.favorite'),
            icon: <HeartOutlined />
        }
    ];

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('items_list.table.actions-tooltips.informations'),
            icon: <InfoCircleOutlined />,
            size: menuBtnSize
        },
        {
            title: t('global.edit'),
            button: <EditRecordBtn record={record} size={menuBtnSize} />
        },
        {
            title: t('items_list.table.actions-tooltips.remove'),
            icon: <IconCross />,
            size: menuBtnSize
        }
    ];

    return (
        <>
            <Info>
                <RecordCard record={record} size={previewSize} lang={lang} />
            </Info>
            <FloatingMenu actions={menuActions} moreActions={moreActions} size={menuBtnSize} />
        </>
    );
}

export default CellInfos;
