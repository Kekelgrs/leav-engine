import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IAmqpManager} from 'infra/amqpManager/amqpManager';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {FileEvents, IFileEventData, IPreviewVersion} from '../../../_types/filesManager';
import {handleCreateEvent} from './handleFileSystem/handleCreateEvent';
import {handleMoveEvent} from './handleFileSystem/handleMoveEvent';
import {handleRemoveEvent} from './handleFileSystem/handleRemoveEvent';
import {handleUpdateEvent} from './handleFileSystem/handleUpdateEvent';
import winston = require('winston');
import {IQueryInfos} from '_types/queryInfos';

export interface IHandleFileSystemDeps {
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    treeDomain: ITreeDomain;
    amqpManager: IAmqpManager;
    previewVersions: IPreviewVersion[];
    logger: winston.Winston;
    config: Config.IConfig;
    utils: IUtils;
}

export interface IHandleFileSystemResources {
    library: string;
}

export const handleEventFileSystem = async (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const event = scanMsg.event;

    switch (event) {
        case FileEvents.CREATE:
            await handleCreateEvent(scanMsg, resources, deps, ctx);
            break;
        case FileEvents.REMOVE:
            await handleRemoveEvent(scanMsg, resources, deps, ctx);
            break;
        case FileEvents.UPDATE:
            await handleUpdateEvent(scanMsg, resources, deps, ctx);
            break;
        case FileEvents.MOVE:
            await handleMoveEvent(scanMsg, resources, deps, ctx);
            break;
        default:
            deps.logger.warn(`[FilesManager] Event ${scanMsg.event} - Event not handle`);
    }
};
