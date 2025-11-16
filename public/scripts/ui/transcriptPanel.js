export class TranscriptPanel {
    constructor(options) {
        this.options = options;
    }
    render(entries) {
        this.options.list.innerHTML = entries
            .map((entry) => `
          <li data-entry-id="${entry.id}">
            <div class="transcript__time">${entry.timestamp}</div>
            <div class="transcript__raw">${entry.rawText}</div>
            ${entry.parsedCommand ? `<div class="transcript__parsed">${entry.parsedCommand}</div>` : ''}
            ${entry.result ? `<div class="transcript__result">${entry.result}</div>` : ''}
          </li>`)
            .join('');
    }
}
//# sourceMappingURL=transcriptPanel.js.map