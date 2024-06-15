import { createSlice } from 'lib/createSlice';
import { Item, createItem, ItemStatus } from 'models/Item';
import { removeFirst } from 'lib/removeFirst';

interface ItemState {
    list: Item[];
    sortHistoryBy: keyof Item;
}

const initialItemState: ItemState = {
    list: [],
    sortHistoryBy: 'lastAdded',
};

const { reducer, configureAction, update } = createSlice(initialItemState, 'ITEM');
export const itemReducer = reducer;
export const updateItems = update;

export const addItem = configureAction<string>(
    'ADD_ITEM',
    name => s => ({ ...s, list: [ ...s.list, createItem({ name }) ]}),
);

export const activateItem = configureAction<Item>(
    'ACTIVATE_ITEM',
    item => s => ({
        ...s,
        list: removeFirst(s.list, item, {
            ...item,
            status: ItemStatus.Active,
            lastAdded: new Date().toISOString(),
        }),
    }),
);

export const deleteItem = configureAction<Item>(
    'DELETE_ITEM',
    item => s => ({ ...s, list: removeFirst(s.list, item) }),
);

export const clearAll = configureAction(
    'CLEAR_ALL',
    () => s => ({ ...s, list: [] }),
);

export const clearCompleted = configureAction(
    'CLEAR_COMPLETED',
    () => s => ({
        ...s,
        list: s.list.filter(item => item.status === ItemStatus.Active),
    }),
);
