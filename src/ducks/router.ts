import { createSlice } from 'lib/createSlice';

export enum RouteName {
    List = 'List',
    History = 'History',
}

export interface RouterState {
    routeName: RouteName;
}

const initialRouterState: RouterState = {
    routeName: RouteName.List,
};

const { reducer, configureAction } = createSlice(initialRouterState, 'ROUTER');
export const routerReducer = reducer;

export const replace = configureAction<{ routeName: RouteName }>(
    'REPLACE',
    ({ routeName }) => s => ({ ...s, routeName }),
);
