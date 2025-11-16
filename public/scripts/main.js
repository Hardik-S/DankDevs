// WS0 — Application bootstrap tying workstreams together.
import { State } from './core/state.js';
import { EventBus } from './core/events.js';
import { Win95Shell } from './ui/win95Shell.js';
import { TranscriptPanel } from './ui/transcriptPanel.js';
import { TranscriptLogger } from './ui/transcriptLogger.js';
import { VoiceListener } from './voice/voiceListener.js';
import { CommandRecognizer } from './voice/commandRecognizer.js';
import { CommandParser } from './command/commandParser.js';
import { CommandExecutor } from './command/commandExecutor.js';
const state = new State();
const voiceBus = new EventBus();
const commandBus = new EventBus();
const parser = new CommandParser();
const executor = new CommandExecutor(state);
const desktopPane = document.querySelector('.desktop-pane');
const root = document.querySelector('.win95-shell');
const cursorLayer = document.querySelector('.desktop-pane .virtual-cursor');
const transcriptContainer = document.querySelector('#transcript-scroller');
const transcriptList = document.querySelector('#transcript');
const statusIndicatorEl = document.querySelector('[data-status-indicator]');
const statusLabelEl = document.querySelector('[data-status-label]');
if (!desktopPane || !root || !cursorLayer || !transcriptList || !transcriptContainer) {
    throw new Error('SoundGO root elements missing');
}
const shell = new Win95Shell({ root, desktopPane, cursorLayer, state });
const transcriptPanel = new TranscriptPanel({ container: transcriptContainer, list: transcriptList });
const voiceListener = new VoiceListener(voiceBus);
const commandRecognizer = new CommandRecognizer(commandBus);
const transcriptLogger = new TranscriptLogger(state);
function renderFromSnapshot(snapshot) {
    if (statusIndicatorEl && statusLabelEl) {
        statusIndicatorEl.dataset.status = snapshot.status;
        statusIndicatorEl.classList.toggle('status-indicator--listening', snapshot.status === 'LISTENING');
        statusIndicatorEl.classList.toggle('status-indicator--idle', snapshot.status === 'IDLE');
        statusLabelEl.textContent = snapshot.status === 'LISTENING' ? 'Listening' : 'Idle';
    }
    transcriptPanel.render(snapshot.transcript);
}
function setStatus(status) {
    const snapshot = state.update((draft) => {
        draft.status = status;
    });
    renderFromSnapshot(snapshot);
}
function logTranscript(rawText, resultStatus, message, command) {
    const snapshot = transcriptLogger.log({
        rawText,
        command: command !== null && command !== void 0 ? command : null,
        result: {
            status: resultStatus,
            message,
        },
    });
    renderFromSnapshot(snapshot);
}
voiceBus.on('WAKE', () => {
    voiceListener.suspendWakeRecognition();
    setStatus('LISTENING');
    commandRecognizer.capture();
});
commandBus.on('COMMAND_RECOGNIZED', ({ rawText }) => {
    voiceListener.resumeWakeRecognition();
    const parseResult = parser.parse(rawText);
    setStatus('IDLE');
    if (!parseResult.ok) {
        logTranscript(rawText, 'ERROR', parseResult.message);
        return;
    }
    const { command } = parseResult;
    const executionResult = executor.execute(command);
    shell.boot();
    logTranscript(rawText, mapExecutionStatusToTranscriptStatus(executionResult.status), executionResult.message, command);
});
commandBus.on('COMMAND_ERROR', ({ message }) => {
    voiceListener.resumeWakeRecognition();
    setStatus('IDLE');
    logTranscript('[command not captured]', 'ERROR', message);
});
commandBus.on('COMMAND_TIMEOUT', ({ message }) => {
    voiceListener.resumeWakeRecognition();
    setStatus('IDLE');
    logTranscript('[no speech detected]', 'WARNING', message);
});
function mapExecutionStatusToTranscriptStatus(status) {
    if (status === 'SUCCESS') {
        return 'SUCCESS';
    }
    if (status === 'SUCCESS_WITH_CLAMP') {
        return 'WARNING';
    }
    return 'ERROR';
}
shell.boot();
voiceListener.start();
renderFromSnapshot(state.snapshot);
// Temporary helpers for manual simulation when no mic access is available.
window.soundGoSimulateWake =
    () => voiceListener.simulateWake();
window.soundGoSimulateCommand = (text) => commandRecognizer.simulateRecognition(text);
//# sourceMappingURL=main.js.map