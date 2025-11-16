// WS2 — Voice command capture.
import type { EventBus } from '../core/events.js';

export type CommandEvents =
  & Record<string, unknown>
  & {
      COMMAND_RECOGNIZED: { rawText: string };
    };

export class CommandRecognizer {
  constructor(private bus: EventBus<CommandEvents>) {}

  capture(): void {
    console.info('Waiting for command after wake phrase');
  }

  simulateRecognition(rawText: string): void {
    this.bus.emit('COMMAND_RECOGNIZED', { rawText });
  }
}
