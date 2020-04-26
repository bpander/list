import { uniqueId } from 'lib/uniqueId'

export enum ItemStatus {
    Active = 'Active',
    Completed = 'Completed',
    Inactive = 'Inactive',
}

export interface Item {
    id: string;
    name: string;
    status: ItemStatus;
}

export const createItem = (overrides: Partial<Item> = {}): Item => {
    return {
        id: uniqueId(),
        name: '',
        status: ItemStatus.Active,
        ...overrides,
    };
};
