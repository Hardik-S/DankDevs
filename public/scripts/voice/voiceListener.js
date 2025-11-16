export class VoiceListener {
    constructor(bus) {
        this.bus = bus;
    }
    start() {
        // Placeholder until Web Speech integration.
        console.info('VoiceListener ready for wake phrase "Hey Go"');
    }
    simulateWake() {
        this.bus.emit('WAKE', { timestamp: new Date().toISOString() });
    }
}
//# sourceMappingURL=voiceListener.js.map