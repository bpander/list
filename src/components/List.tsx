import React, { useState, FormEventHandler, useMemo } from 'react';
import { useRootSelector } from 'rootStore';
import { useDispatch } from 'react-redux';
import { addItem } from 'ducks/item';

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
                    {items.map(item => (
                        <tr key={item.name}>
                            <td className="w-100">{item.name}</td>
                            <td>
                                <div className="flex align-center">
                                    <input type="checkbox" />
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'red' }} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <form onSubmit={onSubmit}>
                <input type="text" value={stagedItem} onChange={e => setStagedItem(e.currentTarget.value)} />
            </form>
        </div>
    );
};
