import React, { useState, FormEventHandler, useMemo, useRef, Fragment, useContext, useEffect, useCallback } from 'react';
import { useRootSelector } from 'rootStore';
import { useDispatch } from 'react-redux';
import { addItem, updateItems, clearCompleted } from 'ducks/item';
import { Item, ItemStatus } from 'models/Item';
import { moveTo } from 'lib/moveTo';
import { toEntries } from 'lib/toEntries';

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

const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
    return 'touches' in event;
};

interface SortableListProps<T> {
    items: T[];
    onChange: (items: T[]) => void;
    renderItem: (item: T, index: number) => JSX.Element;
    renderDropIndicator: () => JSX.Element;
    keyExtractor: (item: T, index: number) => string | number;
}

const SortableList = function<T>(props: SortableListProps<T>) {
    const { onChange } = props;
    const elementMapRef = useRef(new Map<T, Element>());
    const [draggedItem, setDraggedItem] = useState<T | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const value = useMemo((): SortableListContextValue<T> => ({
        draggedItem,
        setDraggedItem,
        elementMap: elementMapRef.current,
    }), [draggedItem]);

    useEffect(() => {
        if (!draggedItem) {
            return;
        }
        let _dropIndex: number | null = null;
        const onMove = (e: MouseEvent | TouchEvent) => {
            _dropIndex = props.items.findIndex(item => {
                const element = elementMapRef.current.get(item);
                if (!element) { return false; }
                const { top, bottom } = element.getBoundingClientRect();
                const mid = (bottom + top) / 2;
                return (isTouchEvent(e) ? e.touches[0] : e).clientY <= mid;
            });
            setDropIndex(_dropIndex);
        };
        const cleanUp = () => {
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchend', cleanUp);
            window.removeEventListener('mouseup', cleanUp);
            const _draggedItem = draggedItem;
            setDraggedItem(null);
            setDropIndex(null);
            if (_dropIndex != null) {
                onChange(moveTo(props.items, _draggedItem, _dropIndex));
            }
        };
        window.addEventListener('touchmove', onMove);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchend', cleanUp);
        window.addEventListener('mouseup', cleanUp);
        return cleanUp;
    }, [draggedItem, onChange, props.items]);

    return (
        <SortableListContext.Provider value={value}>
            {props.items.map((item, index) => (
                <Fragment key={props.keyExtractor(item, index)}>
                    {(index === dropIndex) && props.renderDropIndicator()}
                    {props.renderItem(item, index)}
                </Fragment>
            ))}
            {(dropIndex === -1) && props.renderDropIndicator()}
        </SortableListContext.Provider>
    );
};

const ListItem: React.FC<{ item: Item; onChange: (item: Item) => void }> = props => {
    const ref = useRef<HTMLTableRowElement>(null);
    const ctx = useContext(SortableListContext);
    useEffect(() => {
        if (!ref.current) { return; }
        ctx.elementMap.set(props.item, ref.current);
        return () => { ctx.elementMap.delete(props.item); };
    }, [ctx.elementMap, props.item]);

    return (
        <tr ref={ref} style={(props.item === ctx.draggedItem) ? { opacity: 0.5 } : {}}>
            <td
                className="w-100"
                style={(props.item.status === ItemStatus.Completed)
                    ? { textDecoration: 'line-through', opacity: 0.5 }
                    : undefined
                }
            >
                {props.item.name}
            </td>
            <td>
                <div className="d-flex align-center justify-space-between">
                    <input
                        type="checkbox"
                        checked={props.item.status === ItemStatus.Completed}
                        onChange={e => {
                            const status = e.currentTarget.checked ? ItemStatus.Completed : ItemStatus.Active;
                            props.onChange({ ...props.item, status });
                        }}
                    />
                    <div
                        style={{ touchAction: 'none', fontWeight: 'bold', fontSize: 24, cursor: 'grab', padding: 4 }}
                        onMouseDown={e => {
                            e.preventDefault();
                            ctx.setDraggedItem(props.item);
                        }}
                        onTouchStart={() => ctx.setDraggedItem(props.item)}
                    >⋮⋮</div>
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

    const onChange = useCallback((list: Item[]) => {
        dispatch(updateItems({ list }));
    }, [dispatch]);

    const onItemChange = useCallback((item: Item) => {
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            const newItems = [ ...items ];
            newItems[index] = item;
            onChange(newItems);
        }
    }, [items, onChange]);
    const renderItem = useCallback((item: Item) => <ListItem item={item} onChange={onItemChange} />, [onItemChange]);
    const renderDropIndicator = useCallback(() => {
        return (
            <tr>
                <td colSpan={2}>
                    <div style={{ width: '100%', height: 2, background: 'blue' }} />
                </td>
            </tr>
        );
    }, []);

    const onSortChange = useCallback((newSortedItems: Item[]) => {
        const newSortedItemsMap = new Map(toEntries(newSortedItems, i => i.id));
        dispatch(updateItems({
            list: [
                ...items.filter(i => !newSortedItemsMap.has(i.id)),
                ...newSortedItems,
            ],
        }));
    }, [dispatch, items]);

    return (
        <div>
            <div className="vr-3" />
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
                        onChange={onSortChange}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        renderDropIndicator={renderDropIndicator}
                    />
                </tbody>
            </table>
            <form onSubmit={onSubmit}>
                <input type="text" value={stagedItem} onChange={e => setStagedItem(e.currentTarget.value)} />
                <button type="submit">+</button>
            </form>
            <button onClick={() => dispatch(clearCompleted(undefined))}>Clear Completed</button>
        </div>
    );
};
