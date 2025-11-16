import type { Command } from './commandTypes';
import type { VirtualCursor } from '../ui/virtualCursor';
import type { Win95Shell } from '../ui/win95Shell';

export interface ExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface ExecutorDeps {
  virtualCursor: VirtualCursor;
  shell: Win95Shell;
}

export function createCommandExecutor(deps: ExecutorDeps) {
  function execute(command: Command): ExecutionResult {
    switch (command.type) {
      case 'MOUSE_MOVE_RELATIVE': {
        const { direction, distancePx } = command;
        const deltaX = direction === 'LEFT' ? -distancePx : direction === 'RIGHT' ? distancePx : 0;
        const deltaY = direction === 'UP' ? -distancePx : direction === 'DOWN' ? distancePx : 0;
        deps.virtualCursor.moveRelative(deltaX, deltaY);
        return { success: true, message: `Cursor moved ${direction.toLowerCase()} ${distancePx}px` };
      }
      case 'MOUSE_MOVE_ABSOLUTE': {
        deps.virtualCursor.moveTo(command.x, command.y);
        return { success: true, message: `Cursor moved to (${command.x}, ${command.y})` };
      }
      case 'CLICK':
      case 'DOUBLE_CLICK':
      case 'RIGHT_CLICK': {
        deps.virtualCursor.click(command.type);
        return { success: true, message: command.type.replace('_', ' ') };
      }
      case 'TYPE_TEXT': {
        if (!command.text.trim()) {
          return { success: false, error: 'No text provided' };
        }
        deps.shell.typeInFocusedWindow(command.text);
        return { success: true, message: `Typed ${command.text}` };
      }
      default:
        return { success: false, error: 'Command not implemented' };
    }
  }

  return { execute };
}
