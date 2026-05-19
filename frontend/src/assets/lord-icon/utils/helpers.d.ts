/**
 * Deep clone of value.
 * @param value
 */
export declare function deepClone(value: any): any;
/**
 * Check value is null or undefined.
 * @param value
 * @returns
 */
export declare function isNil(value: any): boolean;
/**
 * Checks if value is object-like. A value is object-like if it"s not null and has a typeof result of "object".
 * @param value
 */
export declare function isObjectLike(value: any): value is object;
/**
 * Checks if path is a direct property of object.
 * @param object
 * @param path
 */
export declare function has<T>(object: T, path: string | string[]): boolean;
/**
 * Get object value from path. Otherwise return defaultValue.
 * @param object
 * @param path
 * @param defaultValue
 */
export declare function get<T>(object: T, path: string | string[], defaultValue?: any): any;
/**
 * Update object value on path.
 * @param object
 * @param path
 * @param value
 */
export declare function set(object: any, path: string | string[], value: any): void;
