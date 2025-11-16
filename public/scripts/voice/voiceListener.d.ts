import type { EventBus } from '../core/events.js';
export type MicrophoneStatus = 'IDLE' | 'REQUESTING_PERMISSION' | 'READY' | 'ERROR' | 'UNSUPPORTED';
export type VoiceEvents = Record<string, unknown> & {
    WAKE: {
        timestamp: string;
    };
    MICROPHONE_STATUS: {
        status: MicrophoneStatus;
        baseline?: number;
        details?: string;
    };
};
export declare class VoiceListener {
    private bus;
    private audioContext;
    private analyserNode;
    private sourceNode;
    private microphoneStatus;
    private noiseBaseline;
    constructor(bus: EventBus<VoiceEvents>);
    start(): void;
    simulateWake(): void;
    private readyMicrophonePipeline;
    private attachAnalyser;
    private estimateNoiseBaseline;
    private updateMicrophoneStatus;
}
//# sourceMappingURL=voiceListener.d.ts.map