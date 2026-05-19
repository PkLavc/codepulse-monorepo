import { IPlayer, ITrigger } from '../interfaces.js';
/**
 * LoopOnHover trigger plays the animation from first to last frame infinitely, when the cursor hovers over the icon.
 */
export declare class LoopOnHover implements ITrigger {
    protected element: HTMLElement;
    protected targetElement: HTMLElement;
    protected player: IPlayer;
    playTimeout: any;
    mouseIn: boolean;
    constructor(element: HTMLElement, targetElement: HTMLElement, player: IPlayer);
    onConnected(): void;
    onDisconnected(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    onComplete(): void;
    play(): void;
    resetPlayDelayTimer(): void;
    get delay(): number;
}
