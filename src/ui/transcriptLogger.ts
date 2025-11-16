// WS5 — Transcript logging utilities for the right-hand panel.
import type { AppState, TranscriptEntry, TranscriptResultStatus } from '../core/state.js';
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

export class TranscriptLogger {
  constructor(private state: { update: (mutator: (draft: AppState) => void) => AppState }) {}

  /**
   * Append a new transcript entry capturing the raw text, parsed summary, and outcome.
   * Returns the latest state snapshot so callers can re-render.
   */
  log(payload: TranscriptLogPayload): AppState {
    const { rawText, command = null, result } = payload;
    const timestamp = new Date();

    return this.state.update((draft) => {
      const entry: TranscriptEntry = {
        id: crypto.randomUUID(),
        timestamp: timestamp.toISOString(),
        rawText,
        result,
      };

      if (command?.summary) {
        entry.parsedCommand = command.summary;
        draft.lastCommand = command;
        draft.commandHistory.unshift(command.summary);
        draft.commandHistory = draft.commandHistory.slice(0, 5);
      }

      draft.transcript.push(entry);
    });
  }
}
