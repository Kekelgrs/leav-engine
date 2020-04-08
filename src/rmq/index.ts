// import {amqp, Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib';
import {RMQConn, RMQMsg} from '../_types/rmq';
import {Config} from '../_types/config';

export const sendToRabbitMQ = async (cfg: Config, msg: string, channel: amqp.Channel): Promise<void> => {
    try {
        await channel.publish(cfg.rmq.exchange, cfg.rmq.routingKey, Buffer.from(msg), {
            persistent: true
        });
    } catch (e) {
        throw e;
    }
};

export const generateMsgRabbitMQ = (
    event: string,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string,
    hash?: string
): string => {
    const msg: RMQMsg = {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey,
        hash
    };

    return JSON.stringify(msg);
};

export const init = async (cfg: Config): Promise<RMQConn> => {
    try {
        const connection: amqp.Connection = await amqp.connect(cfg.rmq.connOpt);
        const channel: amqp.Channel = await connection.createChannel();

        await channel.assertExchange(cfg.rmq.exchange, cfg.rmq.type, {durable: true});

        return {channel, connection};
    } catch (e) {
        throw e;
    }
};
