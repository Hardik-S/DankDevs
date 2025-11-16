import type { AppState, TranscriptResultStatus } from '../core/state.js';
import type { Command } from '../types/commands.js';
export interface LogResultPayload {
    status: TranscriptResultStatus;
    message: string;
}
export interface TranscriptLogPayload {
    rawText: string;
    command?: Command | null;
    result: LogResultPayload;
}
export declare class TranscriptLogger {
    private state;
    constructor(state: {
        update: (mutator: (draft: AppState) => void) => AppState;
    });
    /**
     * Append a new transcript entry capturing the raw text, parsed summary, and outcome.
     * Returns the latest state snapshot so callers can re-render.
     */
    log(payload: TranscriptLogPayload): AppState;
}
//# sourceMappingURL=transcriptLogger.d.ts.map