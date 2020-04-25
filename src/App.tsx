import React from 'react';
import { Provider } from 'react-redux';

import { createRootStore } from 'rootStore';
import { List } from 'components/List';

import 'styles/index.scss';

const store = createRootStore();

function App() {
    return (
        <Provider store={store}>
            <div className="wrapper">
                <List />
            </div>
        </Provider>
    );
};

export default App;
