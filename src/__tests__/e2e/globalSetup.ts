import {Database} from 'arangojs';
import {config} from '../../config';
import {init as initDI} from '../../depsManager';

export async function setup() {
    try {
        const conf: any = await config;

        // Init DB
        const db = new Database({
            url: conf.db.url
        });

        const databases = await db.listDatabases();
        const dbExists = databases.reduce((exists, d) => exists || d === conf.db.name, false);

        if (dbExists) {
            await db.dropDatabase(conf.db.name);
        }

        await db.createDatabase(conf.db.name);

        const {coreContainer} = await initDI();
        const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.migrate(coreContainer);

        const server = coreContainer.cradle['core.interface.server'];
        await server.init();
    } catch (e) {
        console.error(e);
    }
}
