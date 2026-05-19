/**
 * Deep clone of value.
 * @param value
 */
export function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}
/**
 * Check value is null or undefined.
 * @param value
 * @returns
 */
export function isNil(value) {
    return value === null || value === undefined;
}
/**
 * Checks if value is object-like. A value is object-like if it"s not null and has a typeof result of "object".
 * @param value
 */
export function isObjectLike(value) {
    return value !== null && typeof value === "object";
}
/**
 * Checks if path is a direct property of object.
 * @param object
 * @param path
 */
export function has(object, path) {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let current = object;
    for (const key of newPath) {
        if (!isObjectLike(current)) {
            return false;
        }
        if (!(key in current)) {
            return false;
        }
        current = current[key];
    }
    return true;
}
/**
 * Get object value from path. Otherwise return defaultValue.
 * @param object
 * @param path
 * @param defaultValue
 */
export function get(object, path, defaultValue) {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let current = object;
    for (const key of newPath) {
        if (!isObjectLike(current)) {
            return defaultValue;
        }
        if (!(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    return current === undefined ? defaultValue : current;
}
/**
 * Update object value on path.
 * @param object
 * @param path
 * @param value
 */
export function set(object, path, value) {
    let current = object;
    const newPath = Array.isArray(path) ? path : path.split(".");
    for (let i = 0; i < newPath.length; ++i) {
        const key = newPath[i];
        if (key === "__proto__" || key === "prototype" || key === "constructor") {
            return;
        }
        if (!isObjectLike(current)) {
            return;
        }
        if (i === newPath.length - 1) {
            current[key] = value;
        }
        else {
            if (!(key in current)) {
                return;
            }
            current = current[key];
        }
    }
}
//# sourceMappingURL=helpers.js.map
