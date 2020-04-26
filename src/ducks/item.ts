import { createSlice } from 'lib/createSlice';
import { Item, createItem, ItemStatus } from 'models/Item';
import { removeFirst } from 'lib/removeFirst';

interface ItemState {
    list: Item[];
    sortHistoryBy: keyof Item;
}

const initialItemState: ItemState = {
    list: [
        createItem({ name: 'Cream', lastAdded: '2020-04-22T17:10:05.998Z' }),
        createItem({ name: 'Bananas', lastAdded: '2020-04-23T17:10:05.998Z' }),
        createItem({ name: 'Milk', lastAdded: '2020-04-24T17:10:05.998Z', status: ItemStatus.Inactive }),
        createItem({ name: 'Snacks', lastAdded: '2020-04-25T17:10:05.998Z', status: ItemStatus.Inactive }),
        createItem({ name: 'Eggs', lastAdded: '2020-04-26T17:10:05.998Z' }),
    ],
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

export const clearCompleted = configureAction(
    'CLEAR_COMPLETED',
    () => s => ({
        ...s,
        list: s.list.map(item => {
            return (item.status === ItemStatus.Completed)
                ? { ...item, status: ItemStatus.Inactive }
                : item;
        }),
    }),
);
