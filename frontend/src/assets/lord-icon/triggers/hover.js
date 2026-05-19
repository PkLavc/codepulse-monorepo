/**
 * Hover trigger plays the animation from the first to last frame when the cursor hovers over the icon bounding box.
 */
export class Hover {
    element;
    targetElement;
    player;
    constructor(element, targetElement, player) {
        this.element = element;
        this.targetElement = targetElement;
        this.player = player;
        this.onHover = this.onHover.bind(this);
    }
    onConnected() {
        this.targetElement.addEventListener('mouseenter', this.onHover);
    }
    onDisconnected() {
        this.targetElement.removeEventListener('mouseenter', this.onHover);
    }
    onHover() {
        if (this.player.isPlaying) {
            return;
        }
        this.player.playFromBeginning();
    }
}
//# sourceMappingURL=hover.js.map