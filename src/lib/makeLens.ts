import _get from 'lodash.get';
import setWith from 'lodash.setwith';
import clone from 'lodash.clone';

// This is a lens utility based off of https://github.com/utatti/lens.ts with 3 main differences.
// 1. It keeps track of the path from the source to the destination
// 2. It works by feeding that path into lodash's get/setWith functions
// 3. It doesn't use proxies (so it can be supported in more environments)

const setIn = <T extends {}, U>(obj: T, path: string | Array<string | number>, value: U): T => {
    if (!path.length) {
        return value as any; // tslint:disable-line no-any
    }
    return setWith(clone(obj), path, value, clone);
};

export type Setter<T> = (state: T) => T;

export interface Lens<T, U = T> {
    k: <K extends keyof U>(key: K) => Lens<T, U[K]>;
    get: (input: T) => U;
    set: (setter: Setter<U>) => Setter<T>;
    pipe: <V>(otherLens: Lens<U, V>) => Lens<T, V>;
    path: (string | number)[];
}

export const makeLensFromPath = <T extends {}, U>(path: (string | number)[]): Lens<T, U> => {
    const get = (input: T) => (!path.length) ? input : _get(input, path);
    return {
        path,
        get,
        k: <K extends keyof U>(key: K) => makeLensFromPath<T, U[K]>([...path, key as (string | number)]),
        set: (setter: Setter<U>) => (input: T) => setIn(input, path, setter(get(input))),
        pipe: <V>(lens: Lens<U, V>) => makeLensFromPath<T, V>([...path, ...lens.path]),
    };
};

export const makeLens = <TInput extends object>(): Lens<TInput> => makeLensFromPath([]);
