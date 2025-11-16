import type { EventBus } from '../core/events';
import type { ListenerStatus } from '../core/state';

export interface VoiceListener {
  setStatus(status: ListenerStatus): void;
}

export function createVoiceListener(events: EventBus): VoiceListener {
  return {
    setStatus(status) {
      events.emit('voice:status', status);
    }
  };
}
