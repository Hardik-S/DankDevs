// WS2 — Voice wake phrase detection.
import type { EventBus } from '../core/events.js';

export type VoiceEvents =
  & Record<string, unknown>
  & {
      WAKE: { timestamp: string };
    };

export class VoiceListener {
  constructor(private bus: EventBus<VoiceEvents>) {}

  start(): void {
    // Placeholder until Web Speech integration.
    console.info('VoiceListener ready for wake phrase "Hey Go"');
  }

  simulateWake(): void {
    this.bus.emit('WAKE', { timestamp: new Date().toISOString() });
  }
}
