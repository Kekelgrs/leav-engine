import {loadConfig} from '@casolutions/config-manager';
import {getConfig} from './getConfig';

describe('test getConfig', () => {
    afterAll(() => jest.resetAllMocks());

    test('Memoize config', async () => {
        const config = {
            rootPath: 'test',
            ICCPath: 'test',
            amqp: {
                protocol: 'test',
                hostname: 'test',
                port: 0,
                username: 'test',
                password: 'test',
                queue: 'test',
                exchange: 'test',
                routingKey: 'test'
            }
        };

        const mockLoadConfig = jest.fn(() => config);

        (loadConfig as jest.FunctionLike) = mockLoadConfig;

        await getConfig();
        await getConfig();

        expect(mockLoadConfig).toBeCalledTimes(1);
    });
});
