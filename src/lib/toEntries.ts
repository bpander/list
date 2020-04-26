
export const toEntries = <T, K>(arr: T[], keyBy: (item: T) => K): Array<[K, T]> => {
    return arr.map(item => [keyBy(item), item]);
};
