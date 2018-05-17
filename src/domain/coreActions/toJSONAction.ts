import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'toJSON',
        description: 'Convert value to a JSON string',
        inputTypes: [ActionsListIOTypes.OBJECT],
        outputTypes: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            return JSON.stringify(value);
        }
    };
}
