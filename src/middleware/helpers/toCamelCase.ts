/* eslint-disable @typescript-eslint/no-explicit-any */
const toCamelCase = (str: string): string => {
    return str.replace(/([-_][a-z])/gi, (match) => {
        return match.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};

export const keysToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            result[toCamelCase(key)] = keysToCamelCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
};
