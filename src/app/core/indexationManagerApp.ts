import {IIndexationManagerDomain} from 'domain/indexationManager/indexationManagerDomain';
import {IQueryInfos} from '_types/queryInfos';

export interface IIndexationManagerApp {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, records?: string[]): Promise<boolean>;
}

interface IDeps {
    'core.domain.indexationManager'?: IIndexationManagerDomain;
}

export default function({'core.domain.indexationManager': indexationManager}: IDeps): IIndexationManagerApp {
    return {
        init: () => indexationManager.init(),
        indexDatabase: (ctx: IQueryInfos, records?: string[]) => indexationManager.indexDatabase(ctx, records)
    };
}
