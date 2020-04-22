import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const res = await dbService.execute({
                query: aql`
                    FOR el in core_attributes
                        FILTER el.multiple_values == null
                        UPDATE el WITH {multiple_values: false} IN core_attributes
                `,
                ctx
            });
        }
    };
}
