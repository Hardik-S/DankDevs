export class VoiceListener {
    constructor(bus) {
        this.bus = bus;
        this.audioContext = null;
        this.analyserNode = null;
        this.sourceNode = null;
        this.microphoneStatus = 'IDLE';
        this.noiseBaseline = 0;
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown microphone error';
            console.error('VoiceListener microphone error:', error);
            this.updateMicrophoneStatus('ERROR', message);
        }
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