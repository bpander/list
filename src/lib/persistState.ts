import merge from 'lodash.merge';
import { Middleware } from 'redux';

import { Lens } from 'lib/makeLens';
import { fromEntries } from 'lib/fromEntries';
import { StorageService } from './storage-service/StorageService';

type Cache = { [name: string]: any }; // tslint:disable-line:no-any

type LensMap<TState, TCache> = {
    [K in keyof TCache]: Lens<TState, TCache[K]>;
};

export interface PersistedStateService<TState> {
    middleware: Middleware<{}, TState>;
    getPreloadedState: () => TState;
}

export const persistState = <TState, TCache extends Cache>(
    initialState: TState,
    storage: StorageService<TCache>,
    lensMap: LensMap<TState, TCache>,
): PersistedStateService<TState> => {
    const lensKeys = Object.keys(lensMap) as Array<keyof TCache>;
    const mutationMap = new Map();

    const updateStorage = () => {
        const updates = fromEntries(Array.from(mutationMap.entries()));
        const current = storage.get();
        storage.set({ ...current, ...updates });
    };

    let isUpdateQueued = false;
    const queueUpdate = async () => {
        if (isUpdateQueued) {
            return;
        }
        isUpdateQueued = true;
        await Promise.resolve();
        updateStorage();
        mutationMap.clear();
        isUpdateQueued = false;
    };

    const middleware: Middleware<{}, TState> = ({ getState }) => next => action => {
        const prevState = getState();
        const result = next(action);
        const state = getState();
        lensKeys.forEach(lensKey => {
            const lens = lensMap[lensKey];
            const newValue = lens.get(state);
            if (newValue !== lens.get(prevState)) {
                return mutationMap.set(lensKey, newValue);
            }
        });
        if (mutationMap.size) {
            queueUpdate();
        }
        return result;
    };

    const getPreloadedState = (): TState => {
        const cache = storage.get();
        const preloadedState = lensKeys.reduce((running, key) => {
            if (key in cache) {
                const lens = lensMap[key];
                return lens.set(() => cache[key])(running);
            }
            return running;
        }, {} as TState);
        return merge({}, initialState, preloadedState);
    };

    return { middleware, getPreloadedState };
};
