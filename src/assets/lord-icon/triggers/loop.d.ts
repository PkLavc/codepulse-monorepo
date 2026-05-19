import { IPlayer, ITrigger } from '../interfaces.js';
/**
 * Loop trigger plays the animation from first to last frame infinitely, with no interaction necessary.
 */
export declare class Loop implements ITrigger {
    protected element: HTMLElement;
    protected targetElement: HTMLElement;
    protected player: IPlayer;
    private playTimeout;
    constructor(element: HTMLElement, targetElement: HTMLElement, player: IPlayer);
    onReady(): void;
    onComplete(): void;
    onDisconnected(): void;
    play(): void;
    resetPlayDelayTimer(): void;
    get delay(): number;
}
