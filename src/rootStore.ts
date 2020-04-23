import { combineReducers, Reducer, createStore } from 'redux';
import { itemReducer } from 'ducks/item';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

export const rootReducer = combineReducers({
    item: itemReducer,
});

type ExtractState<TReducer> = TReducer extends Reducer<infer S> ? S : never;
export type RootState = ExtractState<typeof rootReducer>;

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;

export const createRootStore = () => {
    const store = createStore(rootReducer);
    return store;
};
