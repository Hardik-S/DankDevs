import { VirtualCursor } from './virtualCursor.js';
export class Win95Shell {
    constructor(options) {
        this.options = options;
        this.cursor = new VirtualCursor({
            element: options.root.querySelector('.virtual-cursor'),
            state: options.state,
        });
    }
    boot() {
        this.cursor.render();
    }
}
//# sourceMappingURL=win95Shell.js.map