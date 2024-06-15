import React, { useMemo, Fragment, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { createRootStore, useRootDispatch, useRootSelector } from 'rootStore';
import { List } from 'components/List';
import { RouteName, replace } from 'ducks/router';

const store = createRootStore();

const NavLink: React.FC<PropsWithChildren<{ to: RouteName }>> = props => {
    const dispatch = useRootDispatch();
    const onClick = useMemo((): React.MouseEventHandler => e => {
        e.preventDefault();
        dispatch(replace({ routeName: props.to }));
    }, [dispatch, props.to]);
    const routeName = useRootSelector(s => s.router.routeName);
    
    if (routeName === props.to) {
        return <Fragment>{props.children}</Fragment>;
    }

    return <a href={`#${props.to}`} onClick={onClick}>{props.children}</a>;
};

const AppRouter: React.FC = () => {
    const routeName = useRootSelector(s => s.router.routeName);
    switch (routeName) {
        case RouteName.List: return <List />;
    }
};

function App() {
    return (
        <Provider store={store}>
            <div className="wrapper py-4 flex items-baseline">
                <h1 className="m-0 text-2xl">
                    <NavLink to={RouteName.List}>
                        List
                    </NavLink>
                </h1>
                <div className='text-sm ml-1.5'>v{process.env.REACT_APP_VERSION}</div>
            </div>
            <AppRouter />
        </Provider>
    );
};

export default App;
