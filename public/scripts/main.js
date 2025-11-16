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
const desktopPane = document.querySelector('.desktop-pane');
const root = document.querySelector('.win95-shell');
const cursorLayer = document.querySelector('.desktop-pane .virtual-cursor');
const transcriptContainer = document.querySelector('#transcript-scroller');
const transcriptList = document.querySelector('#transcript');
if (!desktopPane || !root || !cursorLayer || !transcriptList || !transcriptContainer) {
    throw new Error('SoundGO root elements missing');
}
const shell = new Win95Shell({ root, desktopPane, cursorLayer, state });
const transcriptPanel = new TranscriptPanel({ container: transcriptContainer, list: transcriptList });
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
    state.update((draft) => {
        const timestamp = new Date();
        const entry = {
            id: crypto.randomUUID(),
            timestamp: timestamp.toISOString(),
            rawText,
            result,
        };
        if (command === null || command === void 0 ? void 0 : command.summary) {
            entry.parsedCommand = command.summary;
            draft.lastCommand = command;
            draft.commandHistory.unshift(command.summary);
            draft.commandHistory = draft.commandHistory.slice(0, 5);
        }
        draft.transcript.push(entry);
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