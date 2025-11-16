export class VoiceListener {
    constructor(bus) {
        this.bus = bus;
        this.audioContext = null;
        this.analyserNode = null;
        this.sourceNode = null;
        this.microphoneStatus = 'IDLE';
        this.noiseBaseline = 0;
        this.wakeRecognition = null;
        this.wakeRecognizerActive = false;
        this.lastWakeTimestamp = 0;
        this.wakeDebounceMs = 1500;
        this.wakePhrase = 'hey go';
    }
    start() {
        console.info('VoiceListener preparing microphone input…');
        void this.readyMicrophonePipeline();
    }
    simulateWake() {
        this.bus.emit('WAKE', { timestamp: new Date().toISOString() });
    }
    async readyMicrophonePipeline() {
        var _a;
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            this.updateMicrophoneStatus('UNSUPPORTED', 'Window context unavailable.');
            return;
        }
        if (!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia)) {
            this.updateMicrophoneStatus('UNSUPPORTED', 'MediaDevices.getUserMedia is not supported.');
            return;
        }
        if (this.microphoneStatus === 'READY') {
            return;
        }
        this.updateMicrophoneStatus('REQUESTING_PERMISSION');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                },
            });
            this.attachAnalyser(stream);
            this.noiseBaseline = await this.estimateNoiseBaseline();
            this.updateMicrophoneStatus('READY');
            this.initializeWakePhraseDetection();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown microphone error';
            console.error('VoiceListener microphone error:', error);
            this.updateMicrophoneStatus('ERROR', message);
        }
    }
    initializeWakePhraseDetection() {
        if (this.wakeRecognition) {
            this.startWakeRecognitionLoop();
            return;
        }
        const recognitionConstructor = this.getSpeechRecognitionConstructor();
        if (!recognitionConstructor) {
            console.warn('[VoiceListener] SpeechRecognition API unavailable — manual wake simulation only.');
            return;
        }
        const recognition = new recognitionConstructor();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => this.processWakeResults(event);
        recognition.onerror = (event) => this.handleWakeRecognitionError(event);
        recognition.onend = () => this.handleWakeRecognitionEnd();
        this.wakeRecognition = recognition;
        this.startWakeRecognitionLoop();
    }
    getSpeechRecognitionConstructor() {
        var _a, _b;
        if (typeof window === 'undefined') {
            return null;
        }
        const extendedWindow = window;
        return (_b = (_a = extendedWindow.SpeechRecognition) !== null && _a !== void 0 ? _a : extendedWindow.webkitSpeechRecognition) !== null && _b !== void 0 ? _b : null;
    }
    startWakeRecognitionLoop() {
        if (!this.wakeRecognition || this.wakeRecognizerActive) {
            return;
        }
        try {
            this.wakeRecognition.start();
            this.wakeRecognizerActive = true;
            console.info('[VoiceListener] Listening for wake phrase "Hey Go"');
        }
        catch (error) {
            console.error('VoiceListener failed to start wake detection', error);
        }
    }
    processWakeResults(event) {
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            if (!(result === null || result === void 0 ? void 0 : result.isFinal)) {
                continue;
            }
            const alternative = result[0];
            if (!(alternative === null || alternative === void 0 ? void 0 : alternative.transcript)) {
                continue;
            }
            this.detectWakePhrase(alternative.transcript);
        }
    }
    detectWakePhrase(transcript) {
        const normalized = transcript.trim().toLowerCase();
        if (!normalized) {
            return;
        }
        if (!normalized.includes(this.wakePhrase)) {
            return;
        }
        const now = Date.now();
        if (now - this.lastWakeTimestamp < this.wakeDebounceMs) {
            console.info('[VoiceListener] Wake phrase ignored due to debounce window.');
            return;
        }
        this.lastWakeTimestamp = now;
        this.bus.emit('WAKE', { timestamp: new Date().toISOString() });
        console.info('[VoiceListener] Wake phrase detected.');
    }
    handleWakeRecognitionError(event) {
        var _a;
        const message = (_a = event.error) !== null && _a !== void 0 ? _a : 'unknown error';
        console.warn(`[VoiceListener] Wake recognition error: ${message}`);
        if (message === 'not-allowed' || message === 'service-not-allowed') {
            this.updateMicrophoneStatus('ERROR', 'Wake recognition blocked by browser permissions.');
            return;
        }
        this.restartWakeRecognition();
    }
    handleWakeRecognitionEnd() {
        this.wakeRecognizerActive = false;
        this.restartWakeRecognition();
    }
    restartWakeRecognition() {
        if (!this.wakeRecognition) {
            return;
        }
        window.setTimeout(() => {
            if (!this.wakeRecognition || this.wakeRecognizerActive) {
                return;
            }
            try {
                this.wakeRecognition.start();
                this.wakeRecognizerActive = true;
            }
            catch (error) {
                console.error('VoiceListener failed to restart wake recognition', error);
            }
        }, 300);
    }
    attachAnalyser(stream) {
        var _a;
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        (_a = this.sourceNode) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.sourceNode.connect(this.analyserNode);
    }
    async estimateNoiseBaseline() {
        var _a;
        if (!this.analyserNode) {
            return 0;
        }
        const analyser = this.analyserNode;
        const bufferLength = analyser.fftSize;
        const buffer = new Uint8Array(bufferLength);
        const samplesToCollect = 32;
        let aggregate = 0;
        for (let i = 0; i < samplesToCollect; i += 1) {
            analyser.getByteTimeDomainData(buffer);
            let sumSquares = 0;
            for (let j = 0; j < bufferLength; j += 1) {
                const value = (_a = buffer[j]) !== null && _a !== void 0 ? _a : 128;
                const centered = (value - 128) / 128;
                sumSquares += centered * centered;
            }
            const rms = Math.sqrt(sumSquares / bufferLength);
            aggregate += rms;
            await new Promise((resolve) => window.setTimeout(resolve, 32));
        }
        return Number((aggregate / samplesToCollect).toFixed(4));
    }
    updateMicrophoneStatus(status, details) {
        this.microphoneStatus = status;
        const payload = { status };
        if (this.noiseBaseline > 0) {
            payload.baseline = this.noiseBaseline;
        }
        if (typeof details === 'string') {
            payload.details = details;
        }
        this.bus.emit('MICROPHONE_STATUS', payload);
        const suffix = details ? ` — ${details}` : '';
        console.info(`[VoiceListener] Microphone status: ${status}${suffix}`);
    }
}
//# sourceMappingURL=voiceListener.js.map