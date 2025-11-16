export class EventBus {
    constructor() {
        this.listeners = {};
    }
    on(event, handler) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
        this.listeners[event].add(handler);
        return () => this.off(event, handler);
    }
    off(event, handler) {
        var _a;
        (_a = this.listeners[event]) === null || _a === void 0 ? void 0 : _a.delete(handler);
    }
    emit(event, payload) {
        var _a;
        (_a = this.listeners[event]) === null || _a === void 0 ? void 0 : _a.forEach((handler) => handler(payload));
    }
}
//# sourceMappingURL=events.js.map