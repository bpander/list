import { createSlice } from 'lib/createSlice';
import { Item, createItem } from 'models/Item';
import { uniqueId } from 'lib/uniqueId';
import { shuffle } from 'lib/shuffle';

interface ItemState {
    list: Item[];
}

const initialItemState: ItemState = {
    list: shuffle([
        {
            id: uniqueId(),
            name: 'Bananas',
        },
        {
            id: uniqueId(),
            name: 'Milk',
        },
        {
            id: uniqueId(),
            name: 'Eggs',
        },
        {
            id: uniqueId(),
            name: 'Cream',
        },
    ]),
};

const { reducer, configureAction, update } = createSlice(initialItemState, 'ITEM');
export const itemReducer = reducer;
export const updateItems = update;

export const addItem = configureAction<string>(
    'ADD_ITEM',
    name => s => ({ ...s, list: [ ...s.list, createItem({ name }) ]}),
);
