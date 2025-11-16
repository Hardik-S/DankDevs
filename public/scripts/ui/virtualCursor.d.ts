import type { State } from '../core/state.js';
export interface VirtualCursorOptions {
    element: HTMLElement;
    workspace: HTMLElement;
    state: State;
}
export declare class VirtualCursor {
    private options;
    private mounted;
    constructor(options: VirtualCursorOptions);
    render(): void;
    private ensureGlyph;
}
//# sourceMappingURL=virtualCursor.d.ts.map