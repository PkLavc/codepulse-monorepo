import { AnimationItem } from 'lottie-web';
import { IconData } from '../interfaces.js';
/**
 * Lottie color type.
 */
export type LottieColor = [number, number, number];
/**
 * Supported field types.
 */
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox';
/**
 * Interface for colors parameters.
 */
export interface IRGBColor {
    r: number;
    g: number;
    b: number;
}
/**
 * Interface for found property.
 */
export interface ILottieProperty {
    name: string;
    path: string;
    value: any;
    type: LottieFieldType;
}
/**
 * Convert hex color to lottie representation.
 * @param hex
 * @returns
 */
export declare function hexToLottieColor(hex: string): LottieColor;
/**
 * Conver lottie color representation to hex.
 * @param value
 * @returns
 */
export declare function lottieColorToHex(value: LottieColor): string;
/**
 * Return all supported customizable properties.
 * @param data Icon data.
 * @param options Options.
 * @returns
 */
export declare function properties(data: IconData, options?: {
    lottieInstance?: boolean;
}): ILottieProperty[];
/**
 * Reset data by indicated properties.
 * @param data
 * @param properties
 */
export declare function resetProperties(data: IconData | AnimationItem, properties: ILottieProperty[]): any;
/**
 * Update data to value by indicated properties.
 * @param data
 * @param properties
 * @param value
 * @param param3
 */
export declare function updateProperties(data: IconData | AnimationItem, properties: ILottieProperty[], value: any, { scale }?: {
    scale?: number;
}): any;
