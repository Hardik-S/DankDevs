import type { AppConfig } from './config';

export type ListenerStatus = 'idle' | 'listening' | 'executing';

export interface CursorState {
  x: number;
  y: number;
}

export interface AppState {
  cursor: CursorState;
  listenerStatus: ListenerStatus;
}

export function createInitialState(config: AppConfig): AppState {
  return {
    cursor: {
      x: config.cursorStartX,
      y: config.cursorStartY
    },
    listenerStatus: 'idle'
  };
}
