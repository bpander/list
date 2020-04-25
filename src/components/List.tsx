import React, { useState, FormEventHandler, useMemo, useRef, Fragment, Ref, useContext, useEffect, useCallback } from 'react';
import { useRootSelector } from 'rootStore';
import { useDispatch } from 'react-redux';
import { addItem } from 'ducks/item';
import { Item } from 'models/Item';

interface SortableListContextValue {
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    elementMap: Map<Item, Ref<Element>>;
}
const SortableListContext = React.createContext<SortableListContextValue>({
    isDragging: false,
    setIsDragging: () => {},
    elementMap: new Map(),
});

interface SortableListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => JSX.Element;
    keyExtractor: (item: T, index: number) => string | number;
}
const SortableList = function<T>(props: SortableListProps<T>) {
    const [isDragging, setIsDragging] = useState(false);
    const value = useMemo((): SortableListContextValue => ({
        isDragging,
        setIsDragging,
        elementMap: new Map(),
    }), [isDragging]);

    const mouseRef = useRef([0, 0]);
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current[0] = e.clientX;
            mouseRef.current[1] = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []);

    return (
        <SortableListContext.Provider value={value}>
            {props.items.map((item, index) => (
                <Fragment key={props.keyExtractor(item, index)}>
                    {props.renderItem(item, index)}
                </Fragment>
            ))}
        </SortableListContext.Provider>
    );
};

const ListItem: React.FC<{ item: Item }> = props => {
    const ref = useRef<HTMLTableRowElement>(null);
    const ctx = useContext(SortableListContext);
    useEffect(() => {
        ctx.elementMap.set(props.item, ref);
        return () => { ctx.elementMap.delete(props.item); };
    }, [ctx.elementMap, props.item]);

    return (
        <tr ref={ref}>
            <td className="w-100">{props.item.name}</td>
            <td>
                <div className="flex align-center">
                    <input type="checkbox" />
                    <div
                        style={{ touchAction: 'none', width: 36, height: 36, borderRadius: '50%', background: 'red' }}
                        onMouseDown={e => {
                            e.preventDefault();
                            e.currentTarget.style.background = 'green';
                            ctx.setIsDragging(true);
                        }}
                    />
                </div>
            </td>
        </tr>
    );
};

const keyExtractor = (item: Item) => item.id;

export const List: React.FC = () => {
    const dispatch = useDispatch();
    const items = useRootSelector(s => s.item.list);
    const [stagedItem, setStagedItem] = useState('');

    const onSubmit = useMemo((): FormEventHandler => e => {
        e.preventDefault();
        const stagedItemSanitized = stagedItem.trim();
        if (stagedItemSanitized) {
            dispatch(addItem(stagedItemSanitized));
            setStagedItem('');
        }
    }, [dispatch, stagedItem]);

    const renderItem = useCallback((item: Item) => <ListItem item={item} />, []);

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <td>Item</td>
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    <SortableList
                        items={items}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    />
                </tbody>
            </table>
            <form onSubmit={onSubmit}>
                <input type="text" value={stagedItem} onChange={e => setStagedItem(e.currentTarget.value)} />
            </form>
        </div>
    );
};
