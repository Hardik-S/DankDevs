import type { Command } from '../types/commands.js';
import type { State } from '../core/state.js';
export declare class CommandExecutor {
    private state;
    constructor(state: State);
    execute(command: Command): void;
}
//# sourceMappingURL=commandExecutor.d.ts.map