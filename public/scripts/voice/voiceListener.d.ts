import type { EventBus } from '../core/events.js';
export type VoiceEvents = Record<string, unknown> & {
    WAKE: {
        timestamp: string;
    };
};
export declare class VoiceListener {
    private bus;
    constructor(bus: EventBus<VoiceEvents>);
    start(): void;
    simulateWake(): void;
}
//# sourceMappingURL=voiceListener.d.ts.map