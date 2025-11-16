// WS2 — Voice wake phrase detection.
import type { EventBus } from '../core/events.js';

type WakeSpeechRecognitionConstructor = new () => WakeSpeechRecognitionInstance;

interface WakeSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface WakeSpeechRecognitionResult extends ArrayLike<WakeSpeechRecognitionAlternative> {
  isFinal: boolean;
  [index: number]: WakeSpeechRecognitionAlternative;
}

interface WakeSpeechRecognitionResultList extends ArrayLike<WakeSpeechRecognitionResult> {
  [index: number]: WakeSpeechRecognitionResult;
}

interface WakeSpeechRecognitionEvent {
  resultIndex: number;
  results: WakeSpeechRecognitionResultList;
}

interface WakeSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface WakeSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: WakeSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WakeSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

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
  private wakeRecognition: WakeSpeechRecognitionInstance | null = null;
  private wakeRecognizerActive = false;
  private lastWakeTimestamp = 0;
  private readonly wakeDebounceMs = 1500;
  private readonly wakePhrase = 'hey go';

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
      this.initializeWakePhraseDetection();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown microphone error';
      console.error('VoiceListener microphone error:', error);
      this.updateMicrophoneStatus('ERROR', message);
    }
  }

  private initializeWakePhraseDetection(): void {
    if (this.wakeRecognition) {
      this.startWakeRecognitionLoop();
      return;
    }

    const recognitionConstructor = this.getSpeechRecognitionConstructor();
    if (!recognitionConstructor) {
      console.warn('[VoiceListener] SpeechRecognition API unavailable — manual wake simulation only.');
      return;
    }

    const recognition = new recognitionConstructor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => this.processWakeResults(event);
    recognition.onerror = (event) => this.handleWakeRecognitionError(event);
    recognition.onend = () => this.handleWakeRecognitionEnd();

    this.wakeRecognition = recognition;
    this.startWakeRecognitionLoop();
  }

  private getSpeechRecognitionConstructor(): WakeSpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const extendedWindow = window as typeof window & {
      SpeechRecognition?: WakeSpeechRecognitionConstructor;
      webkitSpeechRecognition?: WakeSpeechRecognitionConstructor;
    };
    return extendedWindow.SpeechRecognition ?? extendedWindow.webkitSpeechRecognition ?? null;
  }

  private startWakeRecognitionLoop(): void {
    if (!this.wakeRecognition || this.wakeRecognizerActive) {
      return;
    }

    try {
      this.wakeRecognition.start();
      this.wakeRecognizerActive = true;
      console.info('[VoiceListener] Listening for wake phrase "Hey Go"');
    } catch (error) {
      console.error('VoiceListener failed to start wake detection', error);
    }
  }

  private processWakeResults(event: WakeSpeechRecognitionEvent): void {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (!result?.isFinal) {
        continue;
      }
      const alternative = result[0];
      if (!alternative?.transcript) {
        continue;
      }
      this.detectWakePhrase(alternative.transcript);
    }
  }

  private detectWakePhrase(transcript: string): void {
    const normalized = transcript.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    if (!normalized.includes(this.wakePhrase)) {
      return;
    }

    const now = Date.now();
    if (now - this.lastWakeTimestamp < this.wakeDebounceMs) {
      console.info('[VoiceListener] Wake phrase ignored due to debounce window.');
      return;
    }

    this.lastWakeTimestamp = now;
    this.bus.emit('WAKE', { timestamp: new Date().toISOString() });
    console.info('[VoiceListener] Wake phrase detected.');
  }

  private handleWakeRecognitionError(event: WakeSpeechRecognitionErrorEvent): void {
    const message = event.error ?? 'unknown error';
    console.warn(`[VoiceListener] Wake recognition error: ${message}`);
    if (message === 'not-allowed' || message === 'service-not-allowed') {
      this.updateMicrophoneStatus('ERROR', 'Wake recognition blocked by browser permissions.');
      return;
    }
    this.restartWakeRecognition();
  }

  private handleWakeRecognitionEnd(): void {
    this.wakeRecognizerActive = false;
    this.restartWakeRecognition();
  }

  private restartWakeRecognition(): void {
    if (!this.wakeRecognition) {
      return;
    }
    window.setTimeout(() => {
      if (!this.wakeRecognition || this.wakeRecognizerActive) {
        return;
      }
      try {
        this.wakeRecognition.start();
        this.wakeRecognizerActive = true;
      } catch (error) {
        console.error('VoiceListener failed to restart wake recognition', error);
      }
    }, 300);
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
