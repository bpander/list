import { uniqueId } from 'lib/uniqueId'

export interface Item {
    id: string;
    name: string;
}

export const createItem = (overrides: Partial<Item> = {}): Item => {
    return {
        id: uniqueId(),
        name: '',
        ...overrides,
    };
};
