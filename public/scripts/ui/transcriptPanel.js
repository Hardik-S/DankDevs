export class TranscriptPanel {
    constructor(options) {
        this.options = options;
    }
    render(entries) {
        const shouldStickToBottom = this.isPinnedToBottom();
        this.options.list.innerHTML = entries
            .map((entry) => this.renderEntry(entry))
            .join('');
        if (shouldStickToBottom) {
            this.scrollToBottom();
        }
    }
    renderEntry(entry) {
        var _a, _b;
        const parsedSummary = (_a = entry.parsedCommand) !== null && _a !== void 0 ? _a : '—';
        const resultText = (_b = entry.result) !== null && _b !== void 0 ? _b : 'Pending';
        const resultVariant = this.getResultVariant(entry.result);
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
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
            return timestamp;
        }
        return date.toLocaleTimeString();
    }
    getResultVariant(result) {
        if (!result) {
            return 'transcript__result--pending';
        }
        const normalized = result.toLowerCase();
        if (normalized.includes('error') || normalized.includes('fail') || normalized.includes('unrecognized')) {
            return 'transcript__result--error';
        }
        return 'transcript__result--ok';
    }
    isPinnedToBottom() {
        const { container } = this.options;
        const threshold = 24;
        return container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
    }
    scrollToBottom() {
        const { container } = this.options;
        container.scrollTop = container.scrollHeight;
    }
}
//# sourceMappingURL=transcriptPanel.js.map