export class CommandRecognizer {
    constructor(bus) {
        this.bus = bus;
    }
    capture() {
        console.info('Waiting for command after wake phrase');
    }
    simulateRecognition(rawText) {
        this.bus.emit('COMMAND_RECOGNIZED', { rawText });
    }
}
//# sourceMappingURL=commandRecognizer.js.map