import {Channel, Options} from 'amqplib';
import {config} from '../../config';
import {startConsume} from './../../amqp/startConsume';
import {getChannel} from './../../amqp/getChannel/getChannel';

import configSpec = require('../../../config/config_spec.json');

export async function setup() {
    try {
        const conf: any = await config;

        // Do whatever you need to setup your integration tests
        const amqpConfig: Options.Connect = {
            protocol: configSpec.amqp.protocol,
            hostname: configSpec.amqp.hostname,
            username: configSpec.amqp.username,
            password: configSpec.amqp.password,
        };

        const channel: Channel = await getChannel(amqpConfig);

        await channel.assertQueue(configSpec.amqp.consume.queue, {durable: true});
        await new Promise(res => setImmediate(res));

        await startConsume(configSpec);
    } catch (e) {
        console.error(e);
    }
}
