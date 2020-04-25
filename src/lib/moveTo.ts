
export const moveTo = <T>(arr: T[], item: T, targetIndex: number): T[] => {
    const index = arr.indexOf(item);
    if (index === -1 || index === targetIndex) {
        return arr;
    }
    const clone = [ ...arr ];

    clone.splice(index, 1);

    if (targetIndex === -1) {
        clone.push(item);
    } else {
        const modifier = (targetIndex > index) ? -1 : 0;
        clone.splice(targetIndex + modifier, 0, item);
    }

    return clone;
};
