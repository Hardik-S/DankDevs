// WS4 — Shared state & typings.
export type EventHandler<T> = (payload: T) => void;

export class EventBus<TEvents extends Record<string, unknown>> {
  private listeners: {
    [K in keyof TEvents]?: Set<EventHandler<TEvents[K]>>;
  } = {};

  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    this.listeners[event]?.forEach((handler) => handler(payload));
  }
}
