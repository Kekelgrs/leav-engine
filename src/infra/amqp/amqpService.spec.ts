import * as amqp from 'amqplib';
import * as Config from '_types/config';
import amqpService from './amqpService';

const amqpMockConfig: Mockify<Config.IAmqp['connOpt']> = {hostname: 'localhost'};
const mockConfig: Mockify<Config.IConfig> = {
    amqp: amqpMockConfig as Config.IAmqp
};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn()
};

describe('amqp', () => {
    (amqp.connect as jest.FunctionLike) = jest.fn().mockReturnValue({
        createChannel: jest.fn().mockReturnValue(mockAmqpChannel)
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set up message listening', async () => {
        const amqpServ = amqpService({
            'core.infra.amqp': {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
            config: mockConfig as Config.IConfig
        });
        const mockCbFunc = jest.fn();

        await amqpServ.consume('myQueue', 'someRoutingKey', mockCbFunc);

        expect(mockAmqpChannel.consume).toBeCalled();
    });

    test('Publish a message', async () => {
        const amqpServ = amqpService({
            'core.infra.amqp': {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
            config: mockConfig as Config.IConfig
        });

        await amqpServ.publish('exchange', 'someRoutingKey', JSON.stringify({test: 'Some value'}));

        expect(mockAmqpChannel.checkExchange).toBeCalled();
        expect(mockAmqpChannel.publish).toBeCalled();
        expect(mockAmqpChannel.waitForConfirms).toBeCalled();
    });
});
