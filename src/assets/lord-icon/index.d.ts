import { AnimationLoader } from './player.js';
/**
 * Defines `lord-icon` custom element with premade triggers and {@link interfaces.PlayerFactory | player factory}.
 *
 * This method defines the following triggers:
 * - {@link triggers/click.Click | click}
 * - {@link triggers/hover.Hover | hover}
 * - {@link triggers/loop.Loop | loop}
 * - {@link triggers/loop-on-hover.LoopOnHover | loop-on-hover}
 * - {@link triggers/morph.Morph | morph}
 * - {@link triggers/boomerang.Boomerang | boomerang}
 * - {@link triggers/sequence.Sequence | sequence}
 *
 * Example of tag definition with default setup:
 * ```js
 * import lottie from 'lottie-web';
 * import { defineElement } from 'lord-icon-element';
 *
 * defineElement(lottie.loadAnimation);
 * ```
 *
 * And basic usage from markup which is possible after tag defining:
 * ```html
 * <lord-icon trigger="hover" src="/icons/confetti.json"></lord-icon>
 * ```
 *
 * @param animationLoader Use `loadAnimation` from `lottie-web` package.
 */
export declare function defineElement(animationLoader: AnimationLoader): void;
