import { WORKSPACE_DIMENSIONS } from '../core/config.js';
export class CommandExecutor {
    constructor(state) {
        this.state = state;
    }
    execute(command) {
        switch (command.type) {
            case 'MOUSE_MOVE_RELATIVE':
                this.state.update((draft) => {
                    const cursor = draft.cursor;
                    const delta = command.distancePx;
                    if (command.direction === 'LEFT')
                        cursor.x -= delta;
                    if (command.direction === 'RIGHT')
                        cursor.x += delta;
                    if (command.direction === 'UP')
                        cursor.y -= delta;
                    if (command.direction === 'DOWN')
                        cursor.y += delta;
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
            case 'KEY_TYPE':
            case 'KEY_PRESS':
            case 'MOUSE_CLICK':
            case 'MOUSE_DBLCLICK':
            case 'MOUSE_RIGHT_CLICK':
                this.state.update((draft) => {
                    draft.lastCommand = command;
                });
                break;
            default:
                command;
        }
    }
}
//# sourceMappingURL=commandExecutor.js.map