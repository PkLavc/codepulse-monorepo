import { IPlayer, ITrigger } from '../interfaces.js';
/**
 * Hover trigger plays the animation from the first to last frame when the cursor hovers over the icon bounding box.
 */
export declare class Hover implements ITrigger {
    protected element: HTMLElement;
    protected targetElement: HTMLElement;
    protected player: IPlayer;
    constructor(element: HTMLElement, targetElement: HTMLElement, player: IPlayer);
    onConnected(): void;
    onDisconnected(): void;
    onHover(): void;
}
