// WS1/WS5 — Win95 shell UI scaffolding.
import type { State } from '../core/state.js';
import { VirtualCursor } from './virtualCursor.js';

export interface Win95ShellOptions {
  root: HTMLElement;
  state: State;
}

export class Win95Shell {
  private cursor: VirtualCursor;

  constructor(private options: Win95ShellOptions) {
    this.cursor = new VirtualCursor({
      element: options.root.querySelector('.virtual-cursor') as HTMLElement,
      state: options.state,
    });
  }

  boot(): void {
    this.cursor.render();
  }
}
