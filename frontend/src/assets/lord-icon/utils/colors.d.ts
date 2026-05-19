import { IColors } from '../interfaces.js';
/**
 * Return hex color from name.
 *
 * Example:
 * ```js
 * parseColor('red'); // #ff0000
 * ```
 *
 * @param colorName Color name.
 * @returns
 */
export declare function parseColor(colorName: string): string;
/**
 * Parse string with icon colors.
 *
 * Example:
 * ```js
 * parseColors('primary:red,secondary:#00ff00'); // { primary: '#ff0000', secondary: '#00ff00' }
 * ```
 *
 * @param colors Colors definied in string.
 * @returns Object with colors.
 */
export declare function parseColors(colors: string): IColors;
