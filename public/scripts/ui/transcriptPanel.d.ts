import type { State, TranscriptEntry } from '../core/state.js';
export interface TranscriptPanelOptions {
    list: HTMLElement;
    state: State;
}
export declare class TranscriptPanel {
    private options;
    constructor(options: TranscriptPanelOptions);
    render(entries: TranscriptEntry[]): void;
}
//# sourceMappingURL=transcriptPanel.d.ts.map