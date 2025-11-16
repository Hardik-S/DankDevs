// WS2 — Voice command capture.
import type { EventBus } from '../core/events.js';

type CommandSpeechRecognitionConstructor = new () => CommandSpeechRecognitionInstance;

interface CommandSpeechRecognitionAlternative {
  transcript: string;
}

interface CommandSpeechRecognitionResult extends ArrayLike<CommandSpeechRecognitionAlternative> {
  isFinal: boolean;
  [index: number]: CommandSpeechRecognitionAlternative;
}

interface CommandSpeechRecognitionResultList extends ArrayLike<CommandSpeechRecognitionResult> {
  [index: number]: CommandSpeechRecognitionResult;
}

interface CommandSpeechRecognitionEvent {
  resultIndex: number;
  results: CommandSpeechRecognitionResultList;
}

interface CommandSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface CommandSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: CommandSpeechRecognitionEvent) => void) | null;
  onerror: ((event: CommandSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export type CommandEvents =
  & Record<string, unknown>
  & {
      COMMAND_RECOGNIZED: { rawText: string };
      COMMAND_ERROR: { message: string };
      COMMAND_TIMEOUT: { message: string };
    };

export class CommandRecognizer {
  private recognition: CommandSpeechRecognitionInstance | null = null;

  private captureActive = false;

  private captureTimeoutId: number | null = null;

  private hasEmittedForCapture = false;

  private readonly captureWindowMs = 6000;

  private ignoreAbortedError = false;

  constructor(private bus: EventBus<CommandEvents>) {}

  capture(): void {
    console.info('[CommandRecognizer] Waiting for command after wake phrase');

    if (!this.ensureRecognition()) {
      console.warn('[CommandRecognizer] SpeechRecognition unavailable — use simulateRecognition');
      return;
    }

    if (this.captureActive) {
      this.stopActiveCapture({ suppressAbortedLog: true });
    }

    this.hasEmittedForCapture = false;
    this.captureActive = true;

    try {
      this.recognition!.start();
    } catch (error) {
      console.error('[CommandRecognizer] Failed to start capture', error);
      this.captureActive = false;
      return;
    }

    this.captureTimeoutId = window.setTimeout(() => {
      console.info('[CommandRecognizer] Capture timed out without speech');
      this.bus.emit('COMMAND_TIMEOUT', { message: 'No speech detected before timeout.' });
      this.stopActiveCapture({ suppressAbortedLog: true });
    }, this.captureWindowMs);
  }

  simulateRecognition(rawText: string): void {
    this.bus.emit('COMMAND_RECOGNIZED', { rawText });
  }

  private ensureRecognition(): boolean {
    if (this.recognition) {
      return true;
    }
    if (typeof window === 'undefined') {
      return false;
    }

    const constructor = this.getSpeechRecognitionConstructor();
    if (!constructor) {
      return false;
    }

    const recognition = new constructor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => this.handleResult(event);
    recognition.onerror = (event) => this.handleError(event);
    recognition.onend = () => this.handleEnd();

    this.recognition = recognition;
    return true;
  }

  private getSpeechRecognitionConstructor(): CommandSpeechRecognitionConstructor | null {
    const extendedWindow = window as typeof window & {
      SpeechRecognition?: CommandSpeechRecognitionConstructor;
      webkitSpeechRecognition?: CommandSpeechRecognitionConstructor;
    };
    return extendedWindow.SpeechRecognition ?? extendedWindow.webkitSpeechRecognition ?? null;
  }

  private handleResult(event: CommandSpeechRecognitionEvent): void {
    if (!this.captureActive || this.hasEmittedForCapture) {
      return;
    }

    let transcript = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (!result?.isFinal) {
        continue;
      }
      const alternative = result[0];
      if (!alternative?.transcript) {
        continue;
      }
      transcript += alternative.transcript;
    }

    const normalized = transcript.trim();
    if (!normalized) {
      return;
    }

    this.hasEmittedForCapture = true;
    this.bus.emit('COMMAND_RECOGNIZED', { rawText: normalized });
    this.stopActiveCapture({ suppressAbortedLog: true });
  }

  private handleError(event: CommandSpeechRecognitionErrorEvent): void {
    if (event.error === 'aborted' && this.ignoreAbortedError) {
      this.ignoreAbortedError = false;
      return;
    }
    this.ignoreAbortedError = false;
    console.warn(`[CommandRecognizer] Speech recognition error: ${event.error ?? 'unknown'}`);
    const message = event.message ?? event.error ?? 'Unknown speech recognition error';
    this.bus.emit('COMMAND_ERROR', { message });
    this.stopActiveCapture();
  }

  private handleEnd(): void {
    this.captureActive = false;
    this.ignoreAbortedError = false;
    if (this.captureTimeoutId !== null) {
      window.clearTimeout(this.captureTimeoutId);
      this.captureTimeoutId = null;
    }
  }

  private stopActiveCapture(options?: { suppressAbortedLog?: boolean }): void {
    if (!this.captureActive) {
      return;
    }
    if (this.captureTimeoutId !== null) {
      window.clearTimeout(this.captureTimeoutId);
      this.captureTimeoutId = null;
    }
    try {
      if (options?.suppressAbortedLog) {
        this.ignoreAbortedError = true;
      }
      this.recognition?.stop();
    } catch (error) {
      console.warn('[CommandRecognizer] Failed to stop recognition cleanly', error);
    }
    this.captureActive = false;
  }
}
