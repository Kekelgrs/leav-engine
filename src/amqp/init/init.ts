import {Channel} from 'amqplib';

export const initAmqp = async (
    channel: Channel,
    {exchange, queue, routingKey}: {exchange: string; queue: string; routingKey: string},
) => {
    await assertExchange(channel, exchange);
    await assertQueue(channel, queue);
    await bindQueue(channel, queue, exchange, routingKey);
};

export const assertExchange = async (channel: Channel, exchange: string) => {
    try {
        await channel.assertExchange(exchange, 'direct', {durable: true});
    } catch (e) {
        console.error('102 - Error when assert exchange', e.message);
        process.exit(102);
    }
};

export const assertQueue = async (channel: Channel, queue: string) => {
    try {
        await channel.assertQueue(queue, {durable: true});
    } catch (e) {
        console.error('103 - Error when assert queue', e.message);
        process.exit(103);
    }
};

export const bindQueue = async (channel: Channel, queue: string, exchange: string, routingKey: string) => {
    try {
        await channel.bindQueue(queue, exchange, routingKey);
    } catch (e) {
        console.error('104 - Error when bind queue', e.message);
        process.exit(104);
    }
};
