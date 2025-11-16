import type { Command } from '../types/commands.js';
export type ListeningStatus = 'IDLE' | 'LISTENING';
export interface CursorState {
    x: number;
    y: number;
}
export type TranscriptResultStatus = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
export interface TranscriptResult {
    status: TranscriptResultStatus;
    message: string;
}
export interface TranscriptEntry {
    id: string;
    timestamp: string;
    rawText: string;
    parsedCommand?: string;
    result?: TranscriptResult;
}
export interface AppState {
    cursor: CursorState;
    transcript: TranscriptEntry[];
    lastCommand?: Command;
    commandHistory: string[];
    status: ListeningStatus;
}
export declare class State {
    private state;
    get snapshot(): AppState;
    update(mutator: (draft: AppState) => void): AppState;
}
//# sourceMappingURL=state.d.ts.map