type EventHandler<T> = (payload: T) => void;

type EventMap = {
  'voice:status': import('./state').ListenerStatus;
  'command:raw': string;
};

export interface EventBus {
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void;
}

export function createEventBus(): EventBus {
  const handlers: { [K in keyof EventMap]?: Set<EventHandler<EventMap[K]>> } = {};

  return {
    emit(event, payload) {
      handlers[event]?.forEach((handler) => handler(payload));
    },
    on(event, handler) {
      if (!handlers[event]) {
        handlers[event] = new Set();
      }
      handlers[event]!.add(handler);
    }
  };
}
