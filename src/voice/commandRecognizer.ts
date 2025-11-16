import type { EventBus } from '../core/events';

export interface CommandRecognizer {
  onCommand(handler: (rawText: string) => void): void;
  ingest(rawText: string): void;
}

export function createCommandRecognizer(events: EventBus): CommandRecognizer {
  let handler: ((rawText: string) => void) | null = null;

  events.on('command:raw', (payload) => {
    handler?.(payload);
  });

  return {
    onCommand(nextHandler) {
      handler = nextHandler;
    },
    ingest(rawText) {
      events.emit('command:raw', rawText);
    }
  };
}
