import { StorageService } from './StorageService';

export const createLocalStorageService = <T>(key: string): StorageService<T> => {
    const get = () => {
        const dataString = localStorage.getItem(key);
        return (dataString) ? JSON.parse(dataString) : {};
    };
    const set = (newValue: T) => {
        localStorage.setItem(key, JSON.stringify(newValue));
    };

    return { get, set };
};
