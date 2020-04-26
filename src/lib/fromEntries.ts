
export const fromEntries = <T>(strMap: [ string, T ][]) => {
    const obj = {} as { [key: string]: T };
    for (const [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
};
