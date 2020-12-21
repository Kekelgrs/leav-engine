import fs from 'fs';
import automate from '../../automate';
import {getConfig} from '../../config';
import * as rmq from '../../rmq';
import * as scan from '../../scan';
import {Config} from '../../_types/config';
import {FilesystemContent} from '../../_types/filesystem';
import {FullTreeContent} from '../../_types/queries';
import {RMQConn} from '../../_types/rmq';
import test4Db from './database/test4';
import test5Db from './database/test5';

let cfg: Config;
let rmqConn: RMQConn;
let inodes: number[];

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await getConfig();
        rmqConn = await rmq.init(cfg.rmq);

        // As queue is only used in tests to consume messages, it's not created in rmq.init. Thus, we have to do it here
        await rmqConn.channel.assertQueue(cfg.rmq.queue);
        await rmqConn.channel.bindQueue(cfg.rmq.queue, cfg.rmq.exchange, cfg.rmq.routingKey);
    } catch (e) {
        console.error(e);
    }
});

afterAll(async done => {
    try {
        await rmqConn.channel.deleteExchange(cfg.rmq.exchange);
        await rmqConn.channel.deleteQueue(cfg.rmq.queue);

        await rmqConn.connection.close();
        done();
    } catch (e) {
        console.error(e);
    }
});

describe('e2e tests', () => {
    test('1 - check filesystem is empty', () => {
        expect.assertions(1);
        return expect(scan.filesystem(cfg.filesystem)).resolves.toHaveLength(0);
    });

    test('2 - filesystem creation', () => {
        expect.assertions(5);

        // Create two directories: dir/sdir from root
        fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir`);
        fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir/sdir`);

        // Create three files with differents paths
        [
            `${cfg.filesystem.absolutePath}/file`,
            `${cfg.filesystem.absolutePath}/dir/sfile`,
            `${cfg.filesystem.absolutePath}/dir/sdir/ssfile`
        ].forEach(p => fs.writeFileSync(p, ''));

        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sdir`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/file`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sfile`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`)).toEqual(true);

        inodes = [
            fs.statSync(`${cfg.filesystem.absolutePath}/dir`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/file`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/dir/sfile`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`).ino
        ];
    });

    test('3 - initialization/creation events', async done => {
        try {
            expect.assertions(10);

            const fsc: FilesystemContent = await scan.filesystem(cfg.filesystem);
            const dbs: FullTreeContent = [];

            await automate(fsc, dbs, rmqConn.channel);

            const expected = {
                // pathAfter as keys
                dir: 'CREATE',
                file: 'CREATE',
                'dir/sdir': 'CREATE',
                'dir/sfile': 'CREATE',
                'dir/sdir/ssfile': 'CREATE'
            };

            await rmqConn.channel.consume(
                cfg.rmq.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathAfter]));
                    expect(expected[m.pathAfter]).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        await rmqConn.channel.cancel('test3');
                        done();
                    }
                },
                {consumerTag: 'test3', noAck: true}
            );
        } catch (e) {
            console.error(e);
        }
    });

    test('4 - move/rename/edit events', async done => {
        try {
            expect.assertions(10);

            fs.renameSync(`${cfg.filesystem.absolutePath}/file`, `${cfg.filesystem.absolutePath}/dir/f`); // MOVE
            fs.renameSync(`${cfg.filesystem.absolutePath}/dir/sfile`, `${cfg.filesystem.absolutePath}/dir/sf`); // RENAME
            fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`, 'content\n'); // EDIT CONTENT

            const fsc: FilesystemContent = await scan.filesystem(cfg.filesystem);
            const dbs: FullTreeContent = test4Db(inodes);

            await automate(fsc, dbs, rmqConn.channel);

            const expected = {
                // pathBefore as keys
                file: {pathAfter: 'dir/f', event: 'MOVE'},
                'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'},
                'dir/sdir/ssfile': {pathAfter: 'dir/sdir/ssfile', event: 'UPDATE'}
            };

            rmqConn.channel.consume(
                cfg.rmq.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
                    expect(expected[m.pathBefore].event).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        expect('f75b8179e4bbe7e2b4a074dcef62de95').toEqual(m.hash);
                        await rmqConn.channel.cancel('test4');
                        done();
                    }
                },
                {consumerTag: 'test4', noAck: true}
            );
        } catch (e) {
            console.error(e);
        }
    });

    test('5 - delete events', async done => {
        try {
            expect.assertions(10);

            fs.rmdirSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true});

            const fsc: FilesystemContent = await scan.filesystem(cfg.filesystem);
            const dbs: FullTreeContent = test5Db(inodes);

            await automate(fsc, dbs, rmqConn.channel);

            const expected = {
                // pathBefore as keys
                dir: 'REMOVE',
                'dir/sdir': 'REMOVE',
                'dir/f': 'REMOVE',
                'dir/sf': 'REMOVE',
                'dir/sdir/ssfile': 'REMOVE'
            };

            rmqConn.channel.consume(
                cfg.rmq.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore]).toEqual(m.event);
                    if (m.pathBefore === 'dir/sdir/ssfile') {
                        await rmqConn.channel.cancel('test5');
                        done();
                    }
                },
                {consumerTag: 'test5', noAck: true}
            );
        } catch (e) {
            console.error(e);
        }
    });
});
