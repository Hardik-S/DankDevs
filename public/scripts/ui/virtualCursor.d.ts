import type { State } from '../core/state.js';
export interface VirtualCursorOptions {
    element: HTMLElement;
    state: State;
}
export declare class VirtualCursor {
    private options;
    constructor(options: VirtualCursorOptions);
    render(): void;
}
//# sourceMappingURL=virtualCursor.d.ts.map