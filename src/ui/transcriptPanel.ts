// WS5 — Transcript & UX panel.
import type { State, TranscriptEntry } from '../core/state.js';

export interface TranscriptPanelOptions {
  list: HTMLElement;
  state: State;
}

export class TranscriptPanel {
  constructor(private options: TranscriptPanelOptions) {}

  render(entries: TranscriptEntry[]): void {
    this.options.list.innerHTML = entries
      .map(
        (entry) => `
          <li data-entry-id="${entry.id}">
            <div class="transcript__time">${entry.timestamp}</div>
            <div class="transcript__raw">${entry.rawText}</div>
            ${entry.parsedCommand ? `<div class="transcript__parsed">${entry.parsedCommand}</div>` : ''}
            ${entry.result ? `<div class="transcript__result">${entry.result}</div>` : ''}
          </li>`
      )
      .join('');
  }
}
