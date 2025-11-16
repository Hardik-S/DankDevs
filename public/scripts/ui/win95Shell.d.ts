import type { State } from '../core/state.js';
export interface Win95ShellOptions {
    root: HTMLElement;
    state: State;
}
export declare class Win95Shell {
    private options;
    private cursor;
    constructor(options: Win95ShellOptions);
    boot(): void;
}
//# sourceMappingURL=win95Shell.d.ts.map