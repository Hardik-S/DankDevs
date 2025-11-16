// WS1/WS5 — Win95 shell UI scaffolding.
import type { State } from '../core/state.js';
import { VirtualCursor } from './virtualCursor.js';

export interface Win95ShellOptions {
  root: HTMLElement;
  desktopPane: HTMLElement;
  cursorLayer: HTMLElement;
  state: State;
}

export class Win95Shell {
  private cursor: VirtualCursor;
  private taskbarClock: HTMLElement | null;
  private clockIntervalId: number | null = null;

  constructor(private options: Win95ShellOptions) {
    this.cursor = new VirtualCursor({
      element: options.cursorLayer,
      workspace: options.desktopPane,
      state: options.state,
    });
    this.taskbarClock = options.root.querySelector('.taskbar__tray');
  }

  boot(): void {
    this.cursor.render();
    this.mountTaskbarClock();
  }

  private mountTaskbarClock(): void {
    if (!this.taskbarClock) {
      return;
    }

    const renderTime = (): void => {
      const now = new Date();
      this.taskbarClock!.textContent = now.toLocaleTimeString([], {
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
