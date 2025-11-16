// WS3 — Command grammar & execution.
import type { Command } from '../types/commands.js';
import type { State } from '../core/state.js';
import { WORKSPACE_DIMENSIONS } from '../core/config.js';

export class CommandExecutor {
  constructor(private state: State) {}

  execute(command: Command): void {
    switch (command.type) {
      case 'MOUSE_MOVE_RELATIVE':
        this.state.update((draft) => {
          const cursor = draft.cursor;
          const delta = command.distance;
          if (command.direction === 'LEFT') cursor.x -= delta;
          if (command.direction === 'RIGHT') cursor.x += delta;
          if (command.direction === 'UP') cursor.y -= delta;
          if (command.direction === 'DOWN') cursor.y += delta;
          cursor.x = Math.max(0, Math.min(WORKSPACE_DIMENSIONS.width, cursor.x));
          cursor.y = Math.max(0, Math.min(WORKSPACE_DIMENSIONS.height, cursor.y));
          draft.lastCommand = command;
        });
        break;
      case 'MOUSE_MOVE_ABSOLUTE':
        this.state.update((draft) => {
          draft.cursor.x = Math.max(0, Math.min(WORKSPACE_DIMENSIONS.width, command.x));
          draft.cursor.y = Math.max(0, Math.min(WORKSPACE_DIMENSIONS.height, command.y));
          draft.lastCommand = command;
        });
        break;
      case 'KEYBOARD_TYPE':
      case 'MOUSE_CLICK':
      case 'MOUSE_DOUBLE_CLICK':
      case 'MOUSE_RIGHT_CLICK':
        this.state.update((draft) => {
          draft.lastCommand = command;
        });
        break;
      default:
        command satisfies never;
    }
  }
}
