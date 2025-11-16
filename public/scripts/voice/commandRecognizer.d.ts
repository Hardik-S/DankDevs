import type { EventBus } from '../core/events.js';
export type CommandEvents = Record<string, unknown> & {
    COMMAND_RECOGNIZED: {
        rawText: string;
    };
};
export declare class CommandRecognizer {
    private bus;
    constructor(bus: EventBus<CommandEvents>);
    capture(): void;
    simulateRecognition(rawText: string): void;
}
//# sourceMappingURL=commandRecognizer.d.ts.map