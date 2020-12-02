import { uniqueId } from 'lib/uniqueId'

export enum ItemStatus {
    Active = 'Active',
    Completed = 'Completed',
}

export interface Item {
    id: string;
    name: string;
    status: ItemStatus;
    lastAdded: string;
}

export const createItem = (overrides: Partial<Item> = {}): Item => {
    return {
        id: uniqueId(),
        name: '',
        status: ItemStatus.Active,
        lastAdded: new Date().toISOString(),
        ...overrides,
    };
};
