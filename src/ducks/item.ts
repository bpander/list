import { createSlice } from 'lib/createSlice';
import { Item } from 'models/Item';

interface ItemState {
    list: Item[];
}

const initialItemState: ItemState = {
    list: [],
};

const { reducer } = createSlice(initialItemState, 'ITEM');
export const itemReducer = reducer;
