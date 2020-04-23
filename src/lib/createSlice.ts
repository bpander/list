import { Reducer } from 'redux';

export interface FSA<TPayload, TMeta = {}> {
    type: string;
    payload: TPayload;
    error?: boolean;
    meta?: TMeta;
}

export type FSACreator<TPayload> = (payload: TPayload) => FSA<TPayload>;

export interface Slice<S> {

    reducer: Reducer<S>;

    configureAction: <P>(
        type: string,
        reduce: (payload: P) => (state: S) => S,
    ) => FSACreator<P>;

    update: <K extends keyof S>(updates: Pick<S, K>) => FSA<Pick<S, K>>;
}

export const createSlice = <S>(initialState: S, prefix: string): Slice<S> => {
    // tslint:disable-next-line no-any
    const handlerMap: Record<string, (payload: any) => (state: S) => S> = {};

    const configureAction: Slice<S>['configureAction'] = (type, reduce) => {
        const prefixedType = `${prefix}/${type}`;
        handlerMap[prefixedType] = reduce;
        return payload => ({ type: prefixedType, payload });
    };

    const slice: Slice<S> = {
        configureAction,
        reducer: (state = initialState, action) => {
            const handler = handlerMap[action.type];
            if (handler) {
                return handler(action.payload)(state);
            }
            return state;
        },
        update: configureAction('UPDATE', updates => state => ({ ...state, ...updates })),
    };

    return slice;
};
