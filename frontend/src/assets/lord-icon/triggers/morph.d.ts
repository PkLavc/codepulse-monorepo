import { IPlayer, ITrigger } from '../interfaces.js';
/**
 * Hover or click the icon to plays the animation from first to the last frame. After moving or clicking away, the animation plays in reverse.
 */
export declare class Morph implements ITrigger {
    protected element: HTMLElement;
    protected targetElement: HTMLElement;
    protected player: IPlayer;
    constructor(element: HTMLElement, targetElement: HTMLElement, player: IPlayer);
    onConnected(): void;
    onDisconnected(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
}
