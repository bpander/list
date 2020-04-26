import { createSlice } from 'lib/createSlice';
import { Item, createItem, ItemStatus } from 'models/Item';
import { shuffle } from 'lib/shuffle';

interface ItemState {
    list: Item[];
}

const initialItemState: ItemState = {
    list: shuffle([
        createItem({ name: 'Bananas'}),
        createItem({ name: 'Milk' }),
        createItem({ name: 'Eggs' }),
        createItem({ name: 'Cream' }),
    ]),
};

const { reducer, configureAction, update } = createSlice(initialItemState, 'ITEM');
export const itemReducer = reducer;
export const updateItems = update;

export const addItem = configureAction<string>(
    'ADD_ITEM',
    name => s => ({ ...s, list: [ ...s.list, createItem({ name }) ]}),
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
