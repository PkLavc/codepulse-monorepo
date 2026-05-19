import { IPlayer, ITrigger } from '../interfaces.js';
/**
 * Click trigger plays animation after the icon click.
 */
export declare class Click implements ITrigger {
    protected element: HTMLElement;
    protected targetElement: HTMLElement;
    protected player: IPlayer;
    constructor(element: HTMLElement, targetElement: HTMLElement, player: IPlayer);
    onConnected(): void;
    onDisconnected(): void;
    onClick(): void;
}
