import type { TranscriptEntry } from '../core/state.js';
export interface TranscriptPanelOptions {
    container: HTMLElement;
    list: HTMLElement;
}
export declare class TranscriptPanel {
    private options;
    constructor(options: TranscriptPanelOptions);
    render(entries: TranscriptEntry[]): void;
    private renderEntry;
    private formatTimestamp;
    private getResultVariant;
    private isPinnedToBottom;
    private scrollToBottom;
}
//# sourceMappingURL=transcriptPanel.d.ts.map