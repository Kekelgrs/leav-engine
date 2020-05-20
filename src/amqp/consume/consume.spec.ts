import {Channel, ConsumeMessage} from 'amqplib';
import * as config from '../../../config/config_spec.json';
import {processPreview} from '../../processPreview/processPreview';
import {IConfig, IResponse} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {consume, handleMsg} from './consume';

describe('test consume', () => {
    test('execution', async () => {
        const channel: Mockify<Channel> = {
            consume: jest.fn(),
            prefetch: jest.fn(),
        };

        await consume(channel as Channel, config as IConfig);

        expect(channel.consume).toBeCalledWith(config.amqp.consume.queue, expect.anything(), expect.anything());
    });
});

describe('test handleMsg', () => {
    test('call sendResponse', async () => {
        const context = 'context';

        const channel: Mockify<Channel> = {
            ack: jest.fn(),
            prefetch: jest.fn(),
        };

        const msg: Mockify<ConsumeMessage> = {
            content: Buffer.from(
                JSON.stringify({
                    input: 'test',
                    context,
                    versions: [
                        {
                            sizes: [
                                {
                                    size: 600,
                                    output: 'test',
                                },
                            ],
                        },
                    ],
                }),
            ),
        };

        const response: IResponse = {
            input: 'input',
            context,
            results: [
                {
                    error: 0,
                    params: {
                        output: 'test',
                        size: 800,
                        name: 'big',
                    },
                },
            ],
        };

        (processPreview as jest.FunctionLike) = jest.fn(() => response);
        (sendResponse as jest.FunctionLike) = jest.fn();

        await handleMsg(msg as ConsumeMessage, channel as Channel, config as IConfig);

        expect(sendResponse).toBeCalledWith(channel, config.amqp.publish, response);
    });
});
