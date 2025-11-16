// WS1/WS5 — Win95 shell UI scaffolding.
import type { State } from '../core/state.js';

export interface VirtualCursorOptions {
  element: HTMLElement;
  state: State;
}

export class VirtualCursor {
  constructor(private options: VirtualCursorOptions) {}

  render(): void {
    const { x, y } = this.options.state.snapshot.cursor;
    this.options.element.style.transform = `translate(${x}px, ${y}px)`;
  }
}
