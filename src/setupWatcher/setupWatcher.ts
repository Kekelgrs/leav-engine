import {Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import * as Crypto from 'crypto';
import * as fs from 'fs';
import {createClient} from '../redis/redis';
import {IConfig} from '../types';
import {start} from '../watch/watch';

export const getConfig = (configPathArg?: string): IConfig => {
    const configPath = configPathArg ? configPathArg : './config/config.json';

    const rawConfig = fs.readFileSync(configPath);
    const config: IConfig = JSON.parse(rawConfig.toString());
    return config;
};

export const startWatch = async (configPathArg?: string) => {
    const config = getConfig(configPathArg);

    // Check if rootPath exist
    if (!fs.existsSync(config.rootPath)) {
        console.error('2 - rootPath folder not found');
        process.exit(2);
    }

    // We take the rootKey from the config file
    // or we create a hash of the rootPath if no rootKey
    const rootKey =
        config.rootKey ||
        Crypto.createHash('md5')
            .update(config.rootPath)
            .digest('hex');

    createClient(config.redis.host, config.redis.port);

    if (config.amqp) {
        const amqpConfig: Options.Connect = {
            protocol: config.amqp.protocol,
            hostname: config.amqp.hostname,
            username: config.amqp.username,
            password: config.amqp.password
        };

        const exchange = config.amqp.exchange;
        const queue = config.amqp.queue;
        const routingKey = config.amqp.routingKey;

        const channel: Channel = await getChannel(amqpConfig, exchange, queue, routingKey);

        let watchParams = {};
        if (config.watcher && config.watcher.awaitWriteFinish) {
            watchParams = {
                ...config.watcher.awaitWriteFinish,
                verbose: config.verbose
            };
        }

        const watcher = await start(config.rootPath, rootKey, watchParams, {
            channel,
            exchange,
            routingKey
        });

        return watcher;
    } else {
        const watchParams = {verbose: config.verbose};
        return start(config.rootPath, rootKey, watchParams);
    }
};

export const getChannel = async (amqpConfig: any, exchange: string, queue: string, routingKey: string) => {
    return new Promise<Channel>(resolve =>
        amqp.connect(amqpConfig, async (error0: any, connection: Connection | any) => {
            if (error0) {
                console.error("101 - Can't connect to rabbitMQ");
                process.exit(101);
            }

            const ch = await connection.createChannel();

            try {
                await ch.assertExchange(exchange, 'direct', {durable: true});
            } catch (e) {
                console.error('102 - Error when assert exchange', e.message);
                process.exit(102);
            }

            try {
                await ch.assertQueue(queue, {durable: true});
            } catch (e) {
                console.error('103 - Error when assert queue', e.message);
                process.exit(103);
            }

            try {
                await ch.bindQueue(queue, exchange, routingKey);
            } catch (e) {
                console.error('104 - Error when bind queue', e.message);
                process.exit(104);
            }

            resolve(ch);
        })
    );
};
