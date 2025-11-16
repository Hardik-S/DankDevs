// WS0 — Application bootstrap tying workstreams together.
import { State } from './core/state.js';
import { EventBus } from './core/events.js';
import { Win95Shell } from './ui/win95Shell.js';
import { TranscriptPanel } from './ui/transcriptPanel.js';
import { VoiceListener } from './voice/voiceListener.js';
import { CommandRecognizer } from './voice/commandRecognizer.js';
import { CommandParser } from './command/commandParser.js';
import { CommandExecutor } from './command/commandExecutor.js';
const state = new State();
const voiceBus = new EventBus();
const commandBus = new EventBus();
const parser = new CommandParser();
const executor = new CommandExecutor(state);
const root = document.querySelector('.win95-shell');
const transcriptList = document.querySelector('#transcript');
const statusIndicator = document.querySelector('[data-status-indicator]');
const statusLabel = document.querySelector('[data-status-label]');
const commandHistoryList = document.querySelector('#command-history');
if (!root || !transcriptList || !statusIndicator || !statusLabel || !commandHistoryList) {
    throw new Error('SoundGO root elements missing');
}
const statusIndicatorEl = statusIndicator;
const statusLabelEl = statusLabel;
const commandHistoryListEl = commandHistoryList;
const shell = new Win95Shell({ root, state });
const transcriptPanel = new TranscriptPanel({ list: transcriptList, state });
const voiceListener = new VoiceListener(voiceBus);
const commandRecognizer = new CommandRecognizer(commandBus);
function renderFromSnapshot(snapshot) {
    statusIndicatorEl.dataset.status = snapshot.status;
    statusIndicatorEl.classList.toggle('status-indicator--listening', snapshot.status === 'LISTENING');
    statusIndicatorEl.classList.toggle('status-indicator--idle', snapshot.status === 'IDLE');
    statusLabelEl.textContent = snapshot.status === 'LISTENING' ? 'Listening' : 'Idle';
    if (snapshot.commandHistory.length === 0) {
        commandHistoryListEl.innerHTML = '<li class="command-history__empty">No commands yet. Say “Hey Go” to begin.</li>';
    }
    else {
        commandHistoryListEl.innerHTML = snapshot.commandHistory
            .map((summary) => `<li class="command-history__item">${summary}</li>`)
            .join('');
    }
    transcriptPanel.render(snapshot.transcript);
}
function setStatus(status) {
    const snapshot = state.update((draft) => {
        draft.status = status;
    });
    renderFromSnapshot(snapshot);
}
function appendTranscript(rawText, command, result) {
    const snapshot = state.update((draft) => {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            rawText,
            result,
        };
        if (command === null || command === void 0 ? void 0 : command.summary) {
            entry.parsedCommand = command.summary;
            draft.lastCommand = command;
            draft.commandHistory.unshift(command.summary);
            draft.commandHistory = draft.commandHistory.slice(0, 5);
        }
        draft.transcript.unshift(entry);
    });
    renderFromSnapshot(snapshot);
}
voiceBus.on('WAKE', () => {
    setStatus('LISTENING');
    commandRecognizer.capture();
});
commandBus.on('COMMAND_RECOGNIZED', ({ rawText }) => {
    const command = parser.parse(rawText);
    if (!command) {
        setStatus('IDLE');
        appendTranscript(rawText, null, 'Unrecognized command');
        return;
    }
    executor.execute(command);
    shell.boot();
    setStatus('IDLE');
    appendTranscript(rawText, command, 'Executed');
});
shell.boot();
voiceListener.start();
renderFromSnapshot(state.snapshot);
// Temporary helpers for manual simulation when no mic access is available.
window.soundGoSimulateWake =
    () => voiceListener.simulateWake();
window.soundGoSimulateCommand = (text) => commandRecognizer.simulateRecognition(text);
//# sourceMappingURL=main.js.map