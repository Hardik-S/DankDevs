import { VirtualCursor } from './virtualCursor.js';
export class Win95Shell {
    constructor(options) {
        this.options = options;
        this.clockIntervalId = null;
        this.cursor = new VirtualCursor({
            element: options.cursorLayer,
            workspace: options.desktopPane,
            state: options.state,
        });
        this.taskbarClock = options.root.querySelector('.taskbar__tray');
    }
    boot() {
        this.cursor.render();
        this.mountTaskbarClock();
    }
    mountTaskbarClock() {
        if (!this.taskbarClock) {
            return;
        }
        const renderTime = () => {
            const now = new Date();
            this.taskbarClock.textContent = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        };
        renderTime();
        if (this.clockIntervalId) {
            window.clearInterval(this.clockIntervalId);
        }
        this.clockIntervalId = window.setInterval(renderTime, 1000);
    }
}
//# sourceMappingURL=win95Shell.js.map