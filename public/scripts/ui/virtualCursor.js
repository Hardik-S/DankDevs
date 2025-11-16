import { MIDDLE_FINGER_CURSOR_SVG } from '../assets/middleFingerCursor.js';
export class VirtualCursor {
    constructor(options) {
        this.options = options;
        this.mounted = false;
    }
    render() {
        this.ensureGlyph();
        const { x, y } = this.options.state.snapshot.cursor;
        const maxX = Math.max(0, this.options.workspace.clientWidth - this.options.element.offsetWidth);
        const maxY = Math.max(0, this.options.workspace.clientHeight - this.options.element.offsetHeight);
        const clampedX = Math.max(0, Math.min(maxX, x));
        const clampedY = Math.max(0, Math.min(maxY, y));
        this.options.element.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    }
    ensureGlyph() {
        if (this.mounted) {
            return;
        }
        this.options.element.innerHTML = MIDDLE_FINGER_CURSOR_SVG;
        this.options.element.setAttribute('aria-hidden', 'true');
        this.options.element.setAttribute('data-cursor', 'middle-finger');
        this.options.element.style.top = '0px';
        this.options.element.style.left = '0px';
        this.mounted = true;
    }
}
//# sourceMappingURL=virtualCursor.js.map