export class TranscriptLogger {
    constructor(state) {
        this.state = state;
    }
    /**
     * Append a new transcript entry capturing the raw text, parsed summary, and outcome.
     * Returns the latest state snapshot so callers can re-render.
     */
    log(payload) {
        const { rawText, command = null, result } = payload;
        const timestamp = new Date();
        return this.state.update((draft) => {
            const entry = {
                id: this.generateEntryId(),
                timestamp: timestamp.toISOString(),
                rawText,
                result,
            };
            if (command === null || command === void 0 ? void 0 : command.summary) {
                entry.parsedCommand = command.summary;
                draft.lastCommand = command;
            }
            draft.transcript.push(entry);
        });
    }
    generateEntryId() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        const randomSuffix = Math.random().toString(16).slice(2, 10);
        return `transcript-${Date.now()}-${randomSuffix}`;
    }
}
//# sourceMappingURL=transcriptLogger.js.map