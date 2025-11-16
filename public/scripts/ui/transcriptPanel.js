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
        var _a, _b, _c, _d;
        const parsedSummary = (_a = entry.parsedCommand) !== null && _a !== void 0 ? _a : '—';
        const resultText = (_c = (_b = entry.result) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : 'Pending';
        const resultVariant = this.getResultVariant((_d = entry.result) === null || _d === void 0 ? void 0 : _d.status);
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
    getResultVariant(status) {
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