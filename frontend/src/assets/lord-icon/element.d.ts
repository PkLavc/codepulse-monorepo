import { IconData, IconLoader, IPlayer, ITrigger, ITriggerConstructor, PlayerFactory } from './interfaces.js';
/**
 * Supported icon loading strategies by our {@link Element | Element}.
 */
type LoadingType = 'lazy' | 'interaction';
/**
 * Supported attributes for this custom element.
 */
type SUPPORTED_ATTRIBUTES = "colors" | "src" | "icon" | "state" | "trigger" | "loading" | "target" | "stroke";
/**
 * Custom element implementation that supports rendering, customizing and controlling of our icons in simple way.
 *
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { Element } from 'lord-icon-element/element';
 * import { Player } from 'lord-icon-element/player';
 *
 * Element.setPlayerFactory((container, iconData) => {
 *     return new Player(
 *         lottie.loadAnimation,
 *         container,
 *         iconData,
 *     );
 * });
 *
 * customElements.define("lord-icon", Element);
 * ```
 *
 * Notice: you can define this custom element, a lot easier with premade helper method: {@link index.defineElement | defineElement}.
 */
export declare class Element<P extends IPlayer = IPlayer> extends HTMLElement {
    protected static _iconLoader?: IconLoader;
    protected static _playerFactory?: PlayerFactory;
    protected static _definedTriggers: Map<string, ITriggerConstructor>;
    /**
     * Get element version.
     */
    static get version(): string;
    /**
     * Custom element observed attributes.
     */
    static get observedAttributes(): SUPPORTED_ATTRIBUTES[];
    /**
     * Assign callback responsible for loading icons. Allows our {@link element.Element | Element} to load {@link interfaces.IconData | icon data} from any source.
     * Remember to assign _icon loader_ before defining `lord-icon` custom element to take effect.
     *
     * Example:
     * ```js
     * import lottie from 'lottie-web';
     * import { defineElement } from 'lord-icon-element';
     * import { Element } from 'lord-icon-element/element';
     *
     * Element.setIconLoader(async (name) => {
     *     const response = await fetch(`https://example.com/${name}.json`);
     *     return await response.json();
     * });
     *
     * defineElement(lottie.loadAnimation);
     * ```
     *
     * @param loader Custom icon loader callback.
     */
    static setIconLoader(loader: IconLoader): void;
    /**
     * Assign callback which create a player. Player is responsible for customizing icons and playing animations.
     * @param loader
     */
    static setPlayerFactory(loader: PlayerFactory): void;
    /**
     * Define supported trigger. Triggers allows to define interaction strategy with icon.
     * @param name
     * @param triggerClass
     */
    static defineTrigger(name: string, triggerClass: ITriggerConstructor): void;
    protected _root?: ShadowRoot;
    protected _isConnected: boolean;
    protected _isReady: boolean;
    protected _triggerInstance?: ITrigger;
    protected _assignedIconData?: IconData;
    protected _loadedIconData?: IconData;
    protected _player?: IPlayer;
    /**
     * Callback created by one of the lazy loading methods.
     * Enables the process to continue immediately.
     */
    delayedLoading: ((cancel?: boolean) => void) | null;
    /**
     * Handle attribute update.
     * @param name
     * @param oldValue
     * @param newValue
     */
    protected attributeChangedCallback(name: SUPPORTED_ATTRIBUTES, oldValue: any, newValue: any): void;
    /**
     * Element connected.
     */
    protected connectedCallback(): void;
    /**
     * Element disconnected.
     */
    protected disconnectedCallback(): void;
    /**
     * Create DOM elements.
     * @returns
     */
    protected createElements(): void;
    /**
     * Instantiate player intance on demand with assigned player factory.
     * @returns
     */
    protected createPlayer(): Promise<void>;
    /**
     * Destroy connected player and connected trigger.
     * Player is recreated on every icon data change.
     */
    protected destroyPlayer(): void;
    /**
     * Load icon with assigned icon loader or source indicated by src attribute.
     * @returns Icon data.
     */
    protected loadIconData(): Promise<IconData>;
    /**
     * Synchronize element state with player.
     */
    protected refresh(): void;
    /**
     * Update defaults for css variables.
     * Notice: css variables take precedence over colors assigned by other methods!
     */
    protected movePaletteToCssVariables(): void;
    /**
     * Target attribute changed. Element should reload it's trigger.
     */
    protected targetChanged(): void;
    /**
     * Loading attribute changed.
     */
    protected loadingChanged(): void;
    /**
     * Trigger attribute changed. Disconnect old trigger and instantiate new one.
     */
    protected triggerChanged(): void;
    /**
     * Colors attribute changed. Notify about new value player.
     */
    protected colorsChanged(): void;
    /**
     * Stroke attribute changed. Notify about new value player.
     */
    protected strokeChanged(): void;
    /**
     * State attribute changed. Notify about new value player.
     */
    protected stateChanged(): void;
    /**
     * Icon attribute changed. Reload our player.
     */
    protected iconChanged(): void;
    /**
     * Src attribute changed. Reload our player.
     */
    protected srcChanged(): void;
    /**
     * Update current icon. We can assign here icon name handled by {@link interfaces.IconLoader | icon loader} or right away {@link interfaces.IconData | icon data}.
     */
    set icon(value: any);
    /**
     * Get icon (icon name or assiged directly {@link interfaces.IconData | icon data})
     */
    get icon(): any;
    /**
     * Set src value.
     */
    set src(value: string | null);
    /**
     * Get src value.
     */
    get src(): string | null;
    /**
     * Set state value.
     *
     * Notice: you can check available states for loaded icon with `states` property.
     */
    set state(value: string | null);
    /**
     * Get state value.
     */
    get state(): string | null;
    /**
     * Set colors value. We support here string format with comma color separation: "primary:#fdd394,secondary:#03a9f4".
     *
     * Example:
     * ```html
     * <lord-icon colors="primary:#fdd394,secondary:#03a9f4" src="/icons/confetti.json"></lord-icon>
     * ```
     */
    set colors(value: string | null);
    /**
     * Get colors value.
     */
    get colors(): string | null;
    /**
     * Set trigger value. Provide name of already defined trigger!
     */
    set trigger(value: string | null);
    /**
     * Get trigger value.
     */
    get trigger(): string | null;
    /**
     * Set loading strategy. By default {@link interfaces.IconData | icon data} are loaded instantly on {@link interfaces.IPlayer | player} initialisation.
     * It's possible to delay icon loading (with _src_ and _icon_ attribute) by changing _loading_ value to _lazy_.
     */
    set loading(value: LoadingType | null);
    /**
     * Get loading value.
     */
    get loading(): LoadingType | null;
    /**
     * Assign query selector for closest element target used for listening events.
     */
    set target(value: string | null);
    /**
     * Get target value.
     */
    get target(): string | null;
    /**
     * Set stroke value (in range 0-100).
     */
    set stroke(value: number | null);
    /**
     * Get stroke value.
     */
    get stroke(): number | null;
    /**
     * Access animation {@link interfaces.IPlayer | player}.
     */
    get player(): P | undefined;
    /**
     * Check whether the element is ready (instantiated player, trigger and loaded icon data).
     *
     * You can listen for element ready with event listener:
     * ```js
     * element.addEventListener('ready', () => {});
     * ```
     */
    get isReady(): boolean;
    /**
     * Access connected {@link interfaces.ITrigger | trigger} instance.
     */
    get triggerInstance(): ITrigger | undefined;
    /**
     * Access animation container element.
     */
    protected get animationContainer(): HTMLElement | undefined;
    /**
     * Access loaded {@link interfaces.IconData | icon data}.
     */
    protected get iconData(): IconData | undefined;
}
export {};
