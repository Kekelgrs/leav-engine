import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        id: 'toJSON',
        name: 'To JSON',
        description: 'Convert value to a JSON string',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            return JSON.stringify(value);
        }
    };
}
