import {init as initDI} from './depsManager';

(async function() {
    const container = await initDI();
    const server = container.cradle['core.interface.server'];
    const dbUtils = container.cradle['core.infra.db.dbUtils'];
    const cli = container.cradle['core.interface.cli'];

    try {
        const opt = process.argv[2];
        if (typeof opt !== 'undefined' && opt.indexOf('server') !== -1) {
            await server.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('migrate') !== -1) {
            // Run db migrations
            await dbUtils.migrate(container);
        } else {
            await cli.run();
        }
    } catch (e) {
        console.error(e);
    }
})().catch(e => console.error(e));
