export type EventHandler<T> = (payload: T) => void;
export declare class EventBus<TEvents extends Record<string, unknown>> {
    private listeners;
    on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): () => void;
    off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
    emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
}
//# sourceMappingURL=events.d.ts.map