import { combineReducers, Reducer, createStore, applyMiddleware } from 'redux';
import { itemReducer } from 'ducks/item';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { routerReducer } from 'ducks/router';
import { persistState } from 'lib/persistState';
import { createLocalStorageService } from 'lib/storage-service/LocalStorageService';
import { makeLens } from 'lib/makeLens';

export const rootReducer = combineReducers({
    item: itemReducer,
    router: routerReducer,
});

type ExtractState<TReducer> = TReducer extends Reducer<infer S> ? S : never;
export type RootState = ExtractState<typeof rootReducer>;

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;

export const rootL = makeLens<RootState>();

export const createRootStore = () => {
    const localStorageService = createLocalStorageService<{}>('LIST_V1');
    const initialState = rootReducer(undefined, { type: '' });
    const persistedStateService = persistState(initialState, localStorageService, {
        ITEM_V1: rootL.k('item'),
    });
    const store = createStore(
        rootReducer,
        persistedStateService.getPreloadedState(),
        applyMiddleware(persistedStateService.middleware),
    );

    return store;
};
