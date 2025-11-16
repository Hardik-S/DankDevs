import type { Command } from '../types/commands.js';
import type { State } from '../core/state.js';
export type ExecutionStatus = 'SUCCESS' | 'SUCCESS_WITH_CLAMP' | 'ERROR_NO_TARGET' | 'ERROR_NO_FOCUS' | 'ERROR_ENVIRONMENT' | 'ERROR_UNSUPPORTED_COMMAND';
export interface ExecutionResult {
    status: ExecutionStatus;
    message: string;
    targetDescription?: string;
}
export declare class CommandExecutor {
    private state;
    constructor(state: State);
    execute(command: Command): ExecutionResult;
    private handleMouseMoveRelative;
    private handleMouseMoveAbsolute;
    private handleMouseClick;
    private handleKeyType;
    private handleKeyPress;
    private recordLastCommand;
    private clamp;
    private getDocument;
    private getWorkspaceElement;
    private getCursorViewportPoint;
    private getHitTarget;
    private dispatchClickSequence;
    private dispatchPointerEvent;
    private dispatchMouseEvent;
    private createMouseEventInit;
    private focusElement;
    private isTextAcceptingElement;
    private injectText;
    private dispatchKeyCombo;
    private createModifierKeyboardInit;
    private createKeyboardInit;
    private describeElement;
    private truncate;
    private formatKeyCode;
    private createResult;
}
//# sourceMappingURL=commandExecutor.d.ts.map