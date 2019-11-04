import {init as initDI} from './depsManager';
import {initPlugins} from './pluginsLoader';

(async function() {
    const {coreContainer, pluginsContainer} = await initDI();

    const server = coreContainer.cradle['core.interface.server'];
    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];
    const cli = coreContainer.cradle['core.interface.cli'];

    await initPlugins(coreContainer.cradle.pluginsFolder, pluginsContainer);

    try {
        const opt = process.argv[2];
        if (typeof opt !== 'undefined' && opt.indexOf('server') !== -1) {
            await server.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('migrate') !== -1) {
            // Run db migrations
            await dbUtils.migrate(coreContainer);
        } else {
            await cli.run();
        }
    } catch (e) {
        console.error(e);
    }
})().catch(e => console.error(e));
