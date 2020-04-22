import {IAttribute} from '_types/attribute';
import {IValue, IValuesOptions} from '_types/value';
import {IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IQueryInfos} from '_types/queryInfos';

export interface IValueRepo {
    createValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: number;
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Update an existing value. Field "id" is expected on the value
     */
    updateValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: number;
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Delete an existing value. Field "id" is expected on the value
     */
    deleteValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: number;
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Get all values for given record and attribute
     * @return Array<{}>    Return an empty array if no value found
     */
    getValues({
        library,
        recordId,
        attribute,
        forceGetAllValues,
        options,
        ctx
    }: {
        library: string;
        recordId: number;
        attribute: IAttribute;
        forceGetAllValues?: boolean;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;

    /**
     * Return a specific value based on its ID. Field "id" is expect on the value
     * @return {}   Return null if no value found
     */
    getValueById({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: number;
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;
    clearAllValues({attribute, ctx}: {attribute: IAttribute; ctx: IQueryInfos}): Promise<boolean>;
}

interface IDeps {
    'core.infra.attributeTypes'?: IAttributeTypesRepo;
}

export default function({'core.infra.attributeTypes': attributeTypesRepo = null}: IDeps = {}): IValueRepo {
    return {
        createValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.createValue({library, recordId, attribute, value, ctx});
        },
        updateValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.updateValue({library, recordId, attribute, value, ctx});
        },
        deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.deleteValue({library, recordId, attribute, value, ctx});
        },
        getValues({library, recordId, attribute, forceGetAllValues, options, ctx}): Promise<IValue[]> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.getValues({library, recordId, attribute, forceGetAllValues, options, ctx});
        },
        getValueById({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.getValueById({library, recordId, attribute, value, ctx});
        },
        clearAllValues({attribute, ctx}): Promise<boolean> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.clearAllValues({attribute, ctx});
        }
    };
}
