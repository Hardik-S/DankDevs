import type { EventBus } from '../core/events.js';
export type CommandEvents = Record<string, unknown> & {
    COMMAND_RECOGNIZED: {
        rawText: string;
    };
    COMMAND_ERROR: {
        message: string;
    };
    COMMAND_TIMEOUT: {
        message: string;
    };
};
export declare class CommandRecognizer {
    private bus;
    private recognition;
    private captureActive;
    private captureTimeoutId;
    private hasEmittedForCapture;
    private readonly captureWindowMs;
    private ignoreAbortedError;
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