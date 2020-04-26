
export interface StorageService<T> {
    get: () => T;
    set: (newValue: T) => void;
}
