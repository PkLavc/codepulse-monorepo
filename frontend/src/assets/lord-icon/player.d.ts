import { AnimationConfig, AnimationConfigWithData, AnimationConfigWithPath, AnimationDirection, AnimationItem } from 'lottie-web';
import { IColors, IconData, IPlayer, IProperties, PlayerEventCallback, PlayerEventName } from './interfaces.js';
import { ILottieProperty } from './utils/lottie.js';
/**
 * Type for options supported by {@link player.Player | Player}.
 */
export type LottieOptions = Omit<AnimationConfig, 'container'>;
/**
 * Type for `loadAnimation` method from `lottie-web` package.
 */
export type AnimationLoader = (params: AnimationConfigWithPath | AnimationConfigWithData) => AnimationItem;
/**
 * Scale factor for supported customizable properties.
 */
export declare const PROPERTY_SCALE = 50;
/**
 * Prefix for icon states. Properties with this prefix are handled as icon states.
 */
export declare const STATE_PREFIX = "state-";
/**
 * Default lottie-web options used by provided Player.
 */
export declare const DEFAULT_LOTTIE_WEB_OPTIONS: Omit<AnimationConfig, 'container'>;
/**
 * The player implementation as a wrapper around `lottie-web`.
 *
 * Main purposes:
 *
 * - Provides simple API to control animation and customize icon properties on the fly.
 * - Allows to react on the animation life cycle.
 * - Separate integration with `lottie-web` from our custom element. That way, the player can potentially work without a _custom element_.
 * - Simplifies custom element implementation.
 * - Simplifies testing.
 */
export declare class Player implements IPlayer {
    protected _animationLoader: AnimationLoader;
    protected _container: HTMLElement;
    protected _iconData: any;
    protected _options: LottieOptions;
    protected _lottie?: AnimationItem;
    protected _isReady: boolean;
    protected _colorsProxy?: any;
    protected _direction: AnimationDirection;
    protected _speed: number;
    protected _rawProperties?: ILottieProperty[];
    protected _eventCallbacks: any;
    /**
     *
     * @param animationLoader Provide `loadAnimation` here from `lottie-web`.
     * @param container DOM element in which the animation will be drawn.
     * @param iconData Lottie icon data.
     * @param options Options for `lottie-web`. If not provided {@link DEFAULT_LOTTIE_WEB_OPTIONS | default} will be used.
     */
    constructor(animationLoader: AnimationLoader, container: HTMLElement, iconData: IconData, options?: LottieOptions);
    connect(): void;
    disconnect(): void;
    addEventListener(name: PlayerEventName, callback: PlayerEventCallback): () => void;
    removeEventListener(eventName: PlayerEventName, callback?: PlayerEventCallback): void;
    /**
     * Trigger event.
     * @param eventName Event name.
     * @param args Args.
     */
    protected triggerEvent(eventName: PlayerEventName, args?: any): void;
    /**
     * Refresh animation and notify about that fact.
     */
    protected refresh(): void;
    play(): void;
    playFromBeginning(): void;
    playSegment(from: number, to: number): void;
    pause(): void;
    stop(): void;
    goToFrame(frame: number): void;
    goToFirstFrame(): void;
    goToLastFrame(): void;
    resetProperties(properties?: IProperties): void;
    set colors(colors: IColors | null);
    get colors(): IColors | null;
    set stroke(stroke: number | null);
    get stroke(): number | null;
    set state(state: string | null);
    get state(): string | null;
    set speed(speed: number);
    get speed(): number;
    set direction(direction: AnimationDirection);
    get direction(): AnimationDirection;
    set loop(loop: boolean);
    get loop(): boolean;
    set frame(frame: number);
    get frame(): number;
    get states(): string[];
    get isPlaying(): boolean;
    get isReady(): boolean;
    get frames(): number;
    get duration(): number;
    /**
     * Access to internal lottie player instance.
     */
    get lottie(): AnimationItem | undefined;
    /**
     * Supported customizable properties by loaded icon.
     */
    get rawProperties(): ILottieProperty[];
}
