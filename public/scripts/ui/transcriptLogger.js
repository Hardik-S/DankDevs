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
                id: crypto.randomUUID(),
                timestamp: timestamp.toISOString(),
                rawText,
                result,
            };
            if (command === null || command === void 0 ? void 0 : command.summary) {
                entry.parsedCommand = command.summary;
                draft.lastCommand = command;
                draft.commandHistory.unshift(command.summary);
                draft.commandHistory = draft.commandHistory.slice(0, 5);
            }
            draft.transcript.push(entry);
        });
    }
}
//# sourceMappingURL=transcriptLogger.js.map