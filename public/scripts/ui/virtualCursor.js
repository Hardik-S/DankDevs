const MIDDLE_FINGER_CURSOR_URL = '/assets/middle-finger-cursor.png';
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
        this.options.element.innerHTML = '';
        const image = document.createElement('img');
        image.src = MIDDLE_FINGER_CURSOR_URL;
        image.alt = '';
        image.decoding = 'async';
        image.loading = 'lazy';
        image.width = 64;
        image.height = 64;
        image.draggable = false;
        this.options.element.append(image);
        this.options.element.setAttribute('aria-hidden', 'true');
        this.options.element.setAttribute('data-cursor', 'middle-finger');
        this.options.element.style.top = '0px';
        this.options.element.style.left = '0px';
        this.mounted = true;
    }
}
//# sourceMappingURL=virtualCursor.js.map