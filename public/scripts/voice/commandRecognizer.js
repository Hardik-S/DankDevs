export class CommandRecognizer {
    constructor(bus) {
        this.bus = bus;
        this.recognition = null;
        this.captureActive = false;
        this.captureTimeoutId = null;
        this.hasEmittedForCapture = false;
        this.captureWindowMs = 6000;
    }
    capture() {
        console.info('[CommandRecognizer] Waiting for command after wake phrase');
        if (!this.ensureRecognition()) {
            console.warn('[CommandRecognizer] SpeechRecognition unavailable — use simulateRecognition');
            return;
        }
        if (this.captureActive) {
            this.stopActiveCapture();
        }
        this.hasEmittedForCapture = false;
        this.captureActive = true;
        try {
            this.recognition.start();
        }
        catch (error) {
            console.error('[CommandRecognizer] Failed to start capture', error);
            this.captureActive = false;
            return;
        }
        this.captureTimeoutId = window.setTimeout(() => {
            console.info('[CommandRecognizer] Capture timed out without speech');
            this.stopActiveCapture();
        }, this.captureWindowMs);
    }
    simulateRecognition(rawText) {
        this.bus.emit('COMMAND_RECOGNIZED', { rawText });
    }
    ensureRecognition() {
        if (this.recognition) {
            return true;
        }
        if (typeof window === 'undefined') {
            return false;
        }
        const constructor = this.getSpeechRecognitionConstructor();
        if (!constructor) {
            return false;
        }
        const recognition = new constructor();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => this.handleResult(event);
        recognition.onerror = (event) => this.handleError(event);
        recognition.onend = () => this.handleEnd();
        this.recognition = recognition;
        return true;
    }
    getSpeechRecognitionConstructor() {
        var _a, _b;
        const extendedWindow = window;
        return (_b = (_a = extendedWindow.SpeechRecognition) !== null && _a !== void 0 ? _a : extendedWindow.webkitSpeechRecognition) !== null && _b !== void 0 ? _b : null;
    }
    handleResult(event) {
        if (!this.captureActive || this.hasEmittedForCapture) {
            return;
        }
        let transcript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            if (!(result === null || result === void 0 ? void 0 : result.isFinal)) {
                continue;
            }
            const alternative = result[0];
            if (!(alternative === null || alternative === void 0 ? void 0 : alternative.transcript)) {
                continue;
            }
            transcript += alternative.transcript;
        }
        const normalized = transcript.trim();
        if (!normalized) {
            return;
        }
        this.hasEmittedForCapture = true;
        this.bus.emit('COMMAND_RECOGNIZED', { rawText: normalized });
        this.stopActiveCapture();
    }
    handleError(event) {
        var _a;
        console.warn(`[CommandRecognizer] Speech recognition error: ${(_a = event.error) !== null && _a !== void 0 ? _a : 'unknown'}`);
        this.stopActiveCapture();
    }
    handleEnd() {
        this.captureActive = false;
        if (this.captureTimeoutId !== null) {
            window.clearTimeout(this.captureTimeoutId);
            this.captureTimeoutId = null;
        }
    }
    stopActiveCapture() {
        var _a;
        if (!this.captureActive) {
            return;
        }
        if (this.captureTimeoutId !== null) {
            window.clearTimeout(this.captureTimeoutId);
            this.captureTimeoutId = null;
        }
        try {
            (_a = this.recognition) === null || _a === void 0 ? void 0 : _a.stop();
        }
        catch (error) {
            console.warn('[CommandRecognizer] Failed to stop recognition cleanly', error);
        }
        this.captureActive = false;
    }
}
//# sourceMappingURL=commandRecognizer.js.map