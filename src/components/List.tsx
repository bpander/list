import React, { useState, FormEventHandler, useMemo, useRef, Fragment, useContext, useEffect, useCallback } from 'react';
import { useRootSelector } from 'rootStore';
import { useDispatch } from 'react-redux';
import { addItem } from 'ducks/item';
import { Item } from 'models/Item';

interface SortableListContextValue<T> {
    draggedItem: T | null;
    setDraggedItem: (item: T) => void;
    elementMap: Map<T, Element>;
}
const SortableListContext = React.createContext<SortableListContextValue<any>>({
    draggedItem: null,
    setDraggedItem: () => {},
    elementMap: new Map(),
});

interface SortableListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => JSX.Element;
    keyExtractor: (item: T, index: number) => string | number;
}
const SortableList = function<T>(props: SortableListProps<T>) {
    const elementMapRef = useRef(new Map<T, Element>());
    const [draggedItem, setDraggedItem] = useState<T | null>(null);
    const value = useMemo((): SortableListContextValue<T> => ({
        draggedItem,
        setDraggedItem,
        elementMap: elementMapRef.current,
    }), [draggedItem]);

    useEffect(() => {
        if (!draggedItem) {
            return;
        }
        const onMouseMove = (e: MouseEvent) => {
            const index = props.items.findIndex(item => {
                const element = elementMapRef.current.get(item);
                if (!element) { return false; }
                const { top, bottom } = element.getBoundingClientRect();
                const mid = (bottom + top) / 2;
                return e.clientY <= mid;
            });
            console.log({ index });
        };
        const cleanUp = () => {
            window.removeEventListener('mouseup', cleanUp);
            window.removeEventListener('mousemove', onMouseMove);
            setDraggedItem(null);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', cleanUp);
        return cleanUp;
    }, [draggedItem, props.items]);

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
        if (!ref.current) { return; }
        ctx.elementMap.set(props.item, ref.current);
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
                            ctx.setDraggedItem(props.item);
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
