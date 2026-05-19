/**
 * Hover or click the icon to plays the animation from first to the last frame. After moving or clicking away, the animation plays in reverse.
 */
export class Morph {
    element;
    targetElement;
    player;
    constructor(element, targetElement, player) {
        this.element = element;
        this.targetElement = targetElement;
        this.player = player;
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }
    onConnected() {
        this.targetElement.addEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.addEventListener('mouseleave', this.onMouseLeave);
    }
    onDisconnected() {
        this.targetElement.removeEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.removeEventListener('mouseleave', this.onMouseLeave);
        this.player.direction = 1;
    }
    onMouseEnter() {
        this.player.direction = 1;
        this.player.play();
    }
    onMouseLeave() {
        this.player.direction = -1;
        this.player.play();
    }
}
//# sourceMappingURL=morph.js.map