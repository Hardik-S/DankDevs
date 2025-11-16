import type { EventBus } from '../core/events.js';
export type CommandEvents = Record<string, unknown> & {
    COMMAND_RECOGNIZED: {
        rawText: string;
    };
};
export declare class CommandRecognizer {
    private bus;
    private recognition;
    private captureActive;
    private captureTimeoutId;
    private hasEmittedForCapture;
    private readonly captureWindowMs;
    constructor(bus: EventBus<CommandEvents>);
    capture(): void;
    simulateRecognition(rawText: string): void;
    private ensureRecognition;
    private getSpeechRecognitionConstructor;
    private handleResult;
    private handleError;
    private handleEnd;
    private stopActiveCapture;
}
//# sourceMappingURL=commandRecognizer.d.ts.map