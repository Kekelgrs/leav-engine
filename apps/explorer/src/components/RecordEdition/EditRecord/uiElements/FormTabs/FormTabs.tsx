// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormUIElementTypes, IFormTabsSettings, TabsDirection} from '@leav/utils';
import {Tabs} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedTranslation} from 'utils';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {formComponents} from '..';
import {FormElement, IFormElementProps} from '../../_types';

const StyledTabs = styled(Tabs)`
    && {
        padding: 1rem;
        border: 1px solid ${themingVar['@leav-secondary-divider-color']};
        margin: 1rem 0;
        border-radius: 3px;
        overflow: visible;
    }
`;

function FormTabs({element, ...elementProps}: IFormElementProps<IFormTabsSettings>): JSX.Element {
    const [{lang}] = useLang();
    const tabPosition = element.settings.direction === TabsDirection.VERTICAL ? 'left' : 'top';

    return (
        <StyledTabs tabPosition={tabPosition} data-testid="form-tabs">
            {element.settings.tabs.map(tab => {
                const tabContainer: FormElement<{}> = {
                    id: `${element.id}/${tab.id}`,
                    containerId: element.id,
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER],
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    valueError: null,
                    values: null
                };

                return (
                    <Tabs.TabPane tab={localizedTranslation(tab.label, lang)} key={tab.id}>
                        <tabContainer.uiElement {...elementProps} element={tabContainer} />
                    </Tabs.TabPane>
                );
            })}
        </StyledTabs>
    );
}

export default FormTabs;
