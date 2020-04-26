
export const removeFirst = <T>(array: T[], item: T, replacement?: T): T[] => {
    const index = array.indexOf(item);
    if (index === -1) {
        return array;
    }
    const clone = [...array];
    if (replacement) {
        clone.splice(index, 1, replacement);
    } else {
        clone.splice(index, 1);
    }
    return clone;
};
