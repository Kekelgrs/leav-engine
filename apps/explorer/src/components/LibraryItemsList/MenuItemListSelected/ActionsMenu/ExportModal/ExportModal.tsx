// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownloadOutlined, LoadingOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Button, Result, Steps} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import AttributesSelectionList from 'components/AttributesSelectionList';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useStateItem} from '../../../../../Context/StateItemsContext';
import {useActiveLibrary} from '../../../../../hooks/ActiveLibHook/ActiveLibHook';
import {useNotifications} from '../../../../../hooks/NotificationsHook/NotificationsHook';
import {exportQuery} from '../../../../../queries/export/exportQuery';
import {getFileUrl} from '../../../../../utils';
import {EXPORT, EXPORTVariables} from '../../../../../_gqlTypes/EXPORT';
import {
    AttributeType,
    RecordFilterCondition,
    RecordFilterInput,
    RecordFilterOperator
} from '../../../../../_gqlTypes/globalTypes';
import {
    ISelectedAttribute,
    NotificationChannel,
    NotificationPriority,
    NotificationType
} from '../../../../../_types/types';
import ErrorDisplay from '../../../../shared/ErrorDisplay';

const {Step} = Steps;

export interface IExportModalProps {
    open: boolean;
    onClose: () => void;
}

enum ExportSteps {
    ATTRIBUTE_SELECTION = 0,
    PROCESSING = 1,
    DONE = 2
}

const Content = styled.div`
    margin-top: 2em;
`;

const CenteredWrapper = styled.div`
    text-align: center;
`;

function ExportModal({onClose, open}: IExportModalProps): JSX.Element {
    const {t} = useTranslation();
    const {stateItems} = useStateItem();
    const [activeLibrary] = useActiveLibrary();
    const {addNotification} = useNotifications();

    const [selectedAttributes, setSelectedAttributes] = useState<ISelectedAttribute[]>([]);
    const [currentStep, setCurrentStep] = useState<ExportSteps>(ExportSteps.ATTRIBUTE_SELECTION);
    const [filepath, setFilepath] = useState<string>('');

    const [runExport, {error: exportError}] = useLazyQuery<EXPORT, EXPORTVariables>(exportQuery, {
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            setCurrentStep(ExportSteps.DONE);
            setFilepath(data.export);
        },
        onError: error => {
            addNotification({
                type: NotificationType.error,
                priority: NotificationPriority.high,
                channel: NotificationChannel.passive,
                content: `${t('error.error_occured')}: ${error.message}`
            });
            setCurrentStep(ExportSteps.DONE);
        }
    });

    const _runExport = () => {
        setCurrentStep(ExportSteps.PROCESSING);

        let queryFilters: RecordFilterInput[];
        if (stateItems.allSelected) {
            queryFilters = (stateItems.queryFilters as unknown) as RecordFilterInput[];
        } else {
            const selectedIds = Object.keys(stateItems.itemsSelected);

            // Convert selected IDs to a search query with OR between each ID
            queryFilters = selectedIds.length
                ? [
                      {
                          operator: RecordFilterOperator.OPEN_BRACKET
                      },
                      ...selectedIds.reduce(
                          (allFilters: RecordFilterInput[], id: string, index: number): RecordFilterInput[] => {
                              allFilters.push({
                                  field: 'id',
                                  condition: RecordFilterCondition.EQUAL,
                                  value: id
                              });

                              if (index < selectedIds.length - 1) {
                                  allFilters.push({
                                      operator: RecordFilterOperator.OR
                                  });
                              }

                              return allFilters;
                          },
                          []
                      ),
                      {
                          operator: RecordFilterOperator.CLOSE_BRACKET
                      }
                  ]
                : [];
        }

        // For tree attribute, attribute path is [parent id].[library id].[attribute id].
        // We don't want the library ID
        const attributesToExport = selectedAttributes.length
            ? selectedAttributes.map(selectedAttribute =>
                  selectedAttribute?.parentAttributeData?.type === AttributeType.tree
                      ? `${selectedAttribute?.parentAttributeData.id}.${selectedAttribute.id}`
                      : selectedAttribute.path
              )
            : ['id'];

        runExport({
            variables: {
                library: activeLibrary?.id || '',
                attributes: attributesToExport,
                filters: queryFilters
            }
        });
    };

    const _handleOk = () => {
        if (currentStep === ExportSteps.DONE) {
            onClose();
            return;
        }

        _runExport();
    };
    const validateButtonLabel = t(currentStep === ExportSteps.DONE ? 'global.close' : 'export.start');

    return (
        <Modal
            title={t('export.title')}
            okText={validateButtonLabel}
            cancelText={t('global.cancel')}
            onOk={_handleOk}
            onCancel={onClose}
            visible={open}
            closable
            width="90vw"
            centered
            confirmLoading={currentStep === ExportSteps.PROCESSING}
            bodyStyle={{height: 'calc(100vh - 10rem)'}}
            okButtonProps={{className: 'submit-btn'}}
            destroyOnClose
        >
            <Steps current={currentStep} style={{marginBottom: '2em'}}>
                <Step title={t('export.attributes_selection')}></Step>
                <Step
                    title={t('export.export_generation')}
                    icon={currentStep === ExportSteps.PROCESSING ? <LoadingOutlined /> : null}
                ></Step>
                <Step title={t('export.export_done')} status={exportError ? 'error' : undefined}></Step>
            </Steps>
            <Content>
                {currentStep === ExportSteps.ATTRIBUTE_SELECTION && (
                    <AttributesSelectionList
                        library={activeLibrary!.id}
                        multiple
                        onSelectionChange={setSelectedAttributes}
                        selectedAttributes={selectedAttributes}
                        canExpandExtendedAttributes={false}
                    />
                )}
                {currentStep === ExportSteps.PROCESSING && (
                    <CenteredWrapper data-test-id="processing">{t('global.processing') + '...'}</CenteredWrapper>
                )}
                {currentStep === ExportSteps.DONE && (
                    <CenteredWrapper data-test-id="done">
                        {!exportError ? (
                            <Result
                                status="success"
                                title={t('export.export_done')}
                                extra={[
                                    <Button
                                        key="download-file"
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        href={getFileUrl(filepath)}
                                    >
                                        {t('export.download_file')}
                                    </Button>
                                ]}
                            />
                        ) : (
                            <ErrorDisplay message={exportError.message} />
                        )}
                    </CenteredWrapper>
                )}
            </Content>
        </Modal>
    );
}

export default ExportModal;
