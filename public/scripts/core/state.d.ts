import type { Command } from '../types/commands.js';
export interface CursorState {
    x: number;
    y: number;
}
export interface TranscriptEntry {
    id: string;
    timestamp: string;
    rawText: string;
    parsedCommand?: string;
    result?: string;
}
export interface AppState {
    cursor: CursorState;
    transcript: TranscriptEntry[];
    lastCommand?: Command;
}
export declare class State {
    private state;
    get snapshot(): AppState;
    update(mutator: (draft: AppState) => void): AppState;
}
//# sourceMappingURL=state.d.ts.map