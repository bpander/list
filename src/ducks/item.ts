import { createSlice } from 'lib/createSlice';
import { Item, createItem } from 'models/Item';
import { uniqueId } from 'lib/uniqueId';

interface ItemState {
    list: Item[];
}

const initialItemState: ItemState = {
    list: [
        {
            id: uniqueId(),
            name: 'Bananas',
        },
        {
            id: uniqueId(),
            name: 'Milk',
        },
    ],
};

const { reducer, configureAction } = createSlice(initialItemState, 'ITEM');
export const itemReducer = reducer;

export const addItem = configureAction<string>(
    'ADD_ITEM',
    name => s => ({ ...s, list: [ ...s.list, createItem({ name }) ]}),
);
