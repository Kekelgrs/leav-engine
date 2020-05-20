module.exports = {
    rootPath: '/to_scan',
    rootKey: 'files1',
    redis: {
        host: 'redis',
        port: 6379
    },
    amqp: {
        protocol: 'amqp',
        hostname: 'message_broker',
        port: 15672,
        username: 'guest',
        password: 'guest',
        queue: 'test_files_events',
        exchange: 'test_leav_core',
        routingKey: 'files.event',
        type: 'direct'
    },
    watcher: {
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
        },
        delay: 150
    },
    verbose: true
};
