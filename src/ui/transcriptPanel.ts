// WS5 — Transcript & UX panel.
import type { TranscriptEntry, TranscriptResultStatus } from '../core/state.js';

export interface TranscriptPanelOptions {
  container: HTMLElement;
  list: HTMLElement;
}

export class TranscriptPanel {
  constructor(private options: TranscriptPanelOptions) {}

  render(entries: TranscriptEntry[]): void {
    const shouldStickToBottom = this.isPinnedToBottom();
    this.options.list.innerHTML = entries
      .map((entry) => this.renderEntry(entry))
      .join('');

    if (shouldStickToBottom) {
      this.scrollToBottom();
    }
  }

  private renderEntry(entry: TranscriptEntry): string {
    const parsedSummary = entry.parsedCommand ?? '—';
    const resultText = entry.result?.message ?? 'Pending';
    const resultVariant = this.getResultVariant(entry.result?.status);
    const displayTimestamp = this.formatTimestamp(entry.timestamp);

    return `
      <li class="transcript__entry" data-entry-id="${entry.id}">
        <div class="transcript__row transcript__row--meta">
          <time class="transcript__timestamp" datetime="${entry.timestamp}">${displayTimestamp}</time>
          <span class="transcript__result ${resultVariant}">${resultText}</span>
        </div>
        <div class="transcript__row">
          <span class="transcript__label">Heard</span>
          <span class="transcript__value">${entry.rawText}</span>
        </div>
        <div class="transcript__row">
          <span class="transcript__label">Parsed</span>
          <span class="transcript__value">${parsedSummary}</span>
        </div>
      </li>`;
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }
    return date.toLocaleTimeString();
  }

  private getResultVariant(status?: TranscriptResultStatus): string {
    if (!status) {
      return 'transcript__result--pending';
    }
    if (status === 'ERROR') {
      return 'transcript__result--error';
    }
    if (status === 'WARNING') {
      return 'transcript__result--warning';
    }
    return 'transcript__result--ok';
  }

  private isPinnedToBottom(): boolean {
    const { container } = this.options;
    const threshold = 24;
    return container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
  }

  private scrollToBottom(): void {
    const { container } = this.options;
    container.scrollTop = container.scrollHeight;
  }
}
