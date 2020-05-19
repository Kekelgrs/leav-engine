import automate from './automate';
import {getConfig} from './config';
import * as rmq from './rmq';
import * as scan from './scan';
import {Config} from './_types/config';
import {FilesystemContent} from './_types/filesystem';
import {FullTreeContent} from './_types/queries';
import {RMQConn} from './_types/rmq';

(async function() {
    try {
        const cfg: Config = await getConfig();

        const rmqConn: RMQConn = await rmq.init(cfg.rmq);

        const fsScan: FilesystemContent = await scan.filesystem(cfg.filesystem);
        const dbScan: FullTreeContent = await scan.database(cfg.graphql);

        await automate(fsScan, dbScan, rmqConn.channel);

        await rmqConn.connection.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
