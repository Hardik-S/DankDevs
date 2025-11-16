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
    private wakeRecognition;
    private wakeRecognizerActive;
    private wakeRecognitionSuspended;
    private suppressNextWakeAbortLog;
    private lastWakeTimestamp;
    private readonly wakeDebounceMs;
    private readonly wakePhrase;
    constructor(bus: EventBus<VoiceEvents>);
    start(): void;
    simulateWake(): void;
    suspendWakeRecognition(): void;
    resumeWakeRecognition(): void;
    private readyMicrophonePipeline;
    private initializeWakePhraseDetection;
    private getSpeechRecognitionConstructor;
    private startWakeRecognitionLoop;
    private processWakeResults;
    private detectWakePhrase;
    private handleWakeRecognitionError;
    private handleWakeRecognitionEnd;
    private restartWakeRecognition;
    private ensureWakeRecognitionStopped;
    private attachAnalyser;
    private estimateNoiseBaseline;
    private updateMicrophoneStatus;
}
//# sourceMappingURL=voiceListener.d.ts.map