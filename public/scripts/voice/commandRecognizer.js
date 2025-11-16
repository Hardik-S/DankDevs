export class CommandRecognizer {
    constructor(bus) {
        this.bus = bus;
        this.recognition = null;
        this.captureActive = false;
        this.captureTimeoutId = null;
        this.hasEmittedForCapture = false;
        this.captureWindowMs = 6000;
        this.ignoreAbortedError = false;
    }
    capture() {
        console.info('[CommandRecognizer] Waiting for command after wake phrase');
        if (!this.ensureRecognition()) {
            console.warn('[CommandRecognizer] SpeechRecognition unavailable — use simulateRecognition');
            return;
        }
        if (this.captureActive) {
            this.stopActiveCapture({ suppressAbortedLog: true });
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
            this.bus.emit('COMMAND_TIMEOUT', { message: 'No speech detected before timeout.' });
            this.stopActiveCapture({ suppressAbortedLog: true });
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
        this.stopActiveCapture({ suppressAbortedLog: true });
    }
    handleError(event) {
        var _a, _b, _c;
        if (event.error === 'aborted' && this.ignoreAbortedError) {
            this.ignoreAbortedError = false;
            return;
        }
        this.ignoreAbortedError = false;
        console.warn(`[CommandRecognizer] Speech recognition error: ${(_a = event.error) !== null && _a !== void 0 ? _a : 'unknown'}`);
        const message = (_c = (_b = event.message) !== null && _b !== void 0 ? _b : event.error) !== null && _c !== void 0 ? _c : 'Unknown speech recognition error';
        this.bus.emit('COMMAND_ERROR', { message });
        this.stopActiveCapture();
    }
    handleEnd() {
        this.captureActive = false;
        this.ignoreAbortedError = false;
        if (this.captureTimeoutId !== null) {
            window.clearTimeout(this.captureTimeoutId);
            this.captureTimeoutId = null;
        }
    }
    stopActiveCapture(options) {
        var _a;
        if (!this.captureActive) {
            return;
        }
        if (this.captureTimeoutId !== null) {
            window.clearTimeout(this.captureTimeoutId);
            this.captureTimeoutId = null;
        }
        try {
            if (options === null || options === void 0 ? void 0 : options.suppressAbortedLog) {
                this.ignoreAbortedError = true;
            }
            (_a = this.recognition) === null || _a === void 0 ? void 0 : _a.stop();
        }
        catch (error) {
            console.warn('[CommandRecognizer] Failed to stop recognition cleanly', error);
        }
        this.captureActive = false;
    }
}
//# sourceMappingURL=commandRecognizer.js.map