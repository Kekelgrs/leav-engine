import {ConsumeMessage} from 'amqplib';
import {getFileType} from './getFileType/getFileType';
import {getMsgContent} from './getMsgContent/getMsgContent';
import {IMessageConsume, IResponse, IConfig, IResult} from './../types';
import {handleCheck} from '../check/handleCheck';
import {generatePreview} from './../generatePreview/generatePreview';

export const processPreview = async (msg: ConsumeMessage, config: IConfig): Promise<IResponse> => {
    let msgContent: IMessageConsume;

    try {
        msgContent = getMsgContent(msg);
    } catch (e) {
        return e;
    }

    let type: string;
    try {
        await handleCheck(msgContent, config);
        type = getFileType(msgContent.input);
    } catch (e) {
        return {
            results: [e],
            context: msgContent.context,
        };
    }

    let results: IResult[];
    try {
        results = await generatePreview(msgContent, type, config);
    } catch (e) {
        return {
            results: [e],
            context: msgContent.context,
        };
    }

    return {
        results,
        context: msgContent.context,
    };
};
