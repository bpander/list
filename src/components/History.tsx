import React, { useMemo } from 'react';
import { useRootSelector } from 'rootStore';
import { Item, ItemStatus } from 'models/Item';
import { useDispatch } from 'react-redux';
import { updateItems, activateItem } from 'ducks/item';

interface SortOption {
    facet: keyof Item;
    label: string;
}

const sortOptions: SortOption[] = [
    { facet: 'name', label: 'Name' },
    { facet: 'lastAdded', label: 'Last Added' },
];

const evaluator = (key: keyof Item) => (a: Item, b: Item) => {
    switch (key) {
        case 'name': return a.name.localeCompare(b.name);
        case 'lastAdded': return Date.parse(a.lastAdded) - Date.parse(b.lastAdded);
        default: return 0;
    }
}

export const History: React.FC = () => {
    const dispatch = useDispatch();
    const sortHistoryBy = useRootSelector(s => s.item.sortHistoryBy);
    const items = useRootSelector(s => s.item.list);
    const itemsFiltered = useMemo(() => items.filter(i => i.status === ItemStatus.Inactive), [items]);
    const itemsSorted = useMemo(
        () => itemsFiltered.sort(evaluator(sortHistoryBy)),
        [itemsFiltered, sortHistoryBy],
    );

    return (
        <div>
            <fieldset>
                <legend>Sort by:</legend>
                <ul>
                    {sortOptions.map(o => (
                        <li key={o.facet}>
                            <label>
                                <input
                                    type="radio"
                                    checked={o.facet === sortHistoryBy}
                                    onChange={() => dispatch(updateItems({ sortHistoryBy: o.facet }))}
                                />
                                <span>{o.label}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </fieldset>
            <ol>
                {itemsSorted.map(item => (
                    <li key={item.id}>
                        <div className="d-flex">
                            <span className="flex-grow">
                                {item.name}
                            </span>
                            <button onClick={() => dispatch(activateItem(item))}>Add to list</button>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};
