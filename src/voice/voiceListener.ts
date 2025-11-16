// WS2 — Voice wake phrase detection.
import type { EventBus } from '../core/events.js';

export type MicrophoneStatus = 'IDLE' | 'REQUESTING_PERMISSION' | 'READY' | 'ERROR' | 'UNSUPPORTED';

export type VoiceEvents =
  & Record<string, unknown>
  & {
      WAKE: { timestamp: string };
      MICROPHONE_STATUS: { status: MicrophoneStatus; baseline?: number; details?: string };
    };

export class VoiceListener {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private microphoneStatus: MicrophoneStatus = 'IDLE';
  private noiseBaseline = 0;

  constructor(private bus: EventBus<VoiceEvents>) {}

  start(): void {
    console.info('VoiceListener preparing microphone input…');
    void this.readyMicrophonePipeline();
  }

  simulateWake(): void {
    this.bus.emit('WAKE', { timestamp: new Date().toISOString() });
  }

  private async readyMicrophonePipeline(): Promise<void> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.updateMicrophoneStatus('UNSUPPORTED', 'Window context unavailable.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.updateMicrophoneStatus('UNSUPPORTED', 'MediaDevices.getUserMedia is not supported.');
      return;
    }

    if (this.microphoneStatus === 'READY') {
      return;
    }

    this.updateMicrophoneStatus('REQUESTING_PERMISSION');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      this.attachAnalyser(stream);
      this.noiseBaseline = await this.estimateNoiseBaseline();
      this.updateMicrophoneStatus('READY');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown microphone error';
      console.error('VoiceListener microphone error:', error);
      this.updateMicrophoneStatus('ERROR', message);
    }
  }

  private attachAnalyser(stream: MediaStream): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    this.sourceNode?.disconnect();
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.sourceNode.connect(this.analyserNode);
  }

  private async estimateNoiseBaseline(): Promise<number> {
    if (!this.analyserNode) {
      return 0;
    }

    const analyser = this.analyserNode;
    const bufferLength = analyser.fftSize;
    const buffer = new Uint8Array(bufferLength);
    const samplesToCollect = 32;
    let aggregate = 0;

    for (let i = 0; i < samplesToCollect; i += 1) {
      analyser.getByteTimeDomainData(buffer);
      let sumSquares = 0;
      for (let j = 0; j < bufferLength; j += 1) {
        const value = buffer[j] ?? 128;
        const centered = (value - 128) / 128;
        sumSquares += centered * centered;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);
      aggregate += rms;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 32));
    }

    return Number((aggregate / samplesToCollect).toFixed(4));
  }

  private updateMicrophoneStatus(status: MicrophoneStatus, details?: string): void {
    this.microphoneStatus = status;
    const payload: VoiceEvents['MICROPHONE_STATUS'] = { status };
    if (this.noiseBaseline > 0) {
      payload.baseline = this.noiseBaseline;
    }
    if (typeof details === 'string') {
      payload.details = details;
    }
    this.bus.emit('MICROPHONE_STATUS', payload);
    const suffix = details ? ` — ${details}` : '';
    console.info(`[VoiceListener] Microphone status: ${status}${suffix}`);
  }
}
