// WS4 — Shared state & typings.
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

const initialState: AppState = {
  cursor: { x: 200, y: 200 },
  transcript: [],
};

export class State {
  private state: AppState = structuredClone(initialState);

  get snapshot(): AppState {
    return structuredClone(this.state);
  }

  update(mutator: (draft: AppState) => void): AppState {
    const draft = structuredClone(this.state);
    mutator(draft);
    this.state = draft;
    return this.snapshot;
  }
}
