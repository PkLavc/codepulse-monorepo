import { IPlayer, ITrigger } from '../interfaces.js';
/**
 * Boomerang trigger plays animation from first to last frame when you hover over them, then play in reverse once you move the cursor away.
 */
export declare class Boomerang implements ITrigger {
    protected element: HTMLElement;
    protected targetElement: HTMLElement;
    protected player: IPlayer;
    constructor(element: HTMLElement, targetElement: HTMLElement, player: IPlayer);
    onConnected(): void;
    onDisconnected(): void;
    onComplete(): void;
    onHover(): void;
}
