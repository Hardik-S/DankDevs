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
import type { AppState, ListeningStatus, TranscriptResultStatus } from './core/state.js';
import type { VoiceEvents } from './voice/voiceListener.js';
import type { CommandEvents } from './voice/commandRecognizer.js';
import type { Command } from './types/commands.js';
import type { ExecutionStatus } from './command/commandExecutor.js';

const state = new State();
const voiceBus = new EventBus<VoiceEvents>();
const commandBus = new EventBus<CommandEvents>();
const parser = new CommandParser();
const executor = new CommandExecutor(state);

const desktopPane = document.querySelector<HTMLElement>('.desktop-pane');
const root = document.querySelector<HTMLElement>('.win95-shell');
const cursorLayer = document.querySelector<HTMLElement>('.desktop-pane .virtual-cursor');
const transcriptContainer = document.querySelector<HTMLElement>('#transcript-scroller');
const transcriptList = document.querySelector<HTMLUListElement>('#transcript');
const statusIndicatorEl = document.querySelector<HTMLElement>('[data-status-indicator]');
const statusLabelEl = document.querySelector<HTMLElement>('[data-status-label]');
const commandHistoryListEl = document.querySelector<HTMLUListElement>('#command-history');

if (!desktopPane || !root || !cursorLayer || !transcriptList || !transcriptContainer) {
  throw new Error('SoundGO root elements missing');
}

const shell = new Win95Shell({ root, desktopPane, cursorLayer, state });
const transcriptPanel = new TranscriptPanel({ container: transcriptContainer, list: transcriptList });
const voiceListener = new VoiceListener(voiceBus);
const commandRecognizer = new CommandRecognizer(commandBus);
const transcriptLogger = new TranscriptLogger(state);

function renderFromSnapshot(snapshot: AppState): void {
  if (statusIndicatorEl && statusLabelEl) {
    statusIndicatorEl.dataset.status = snapshot.status;
    statusIndicatorEl.classList.toggle('status-indicator--listening', snapshot.status === 'LISTENING');
    statusIndicatorEl.classList.toggle('status-indicator--idle', snapshot.status === 'IDLE');
    statusLabelEl.textContent = snapshot.status === 'LISTENING' ? 'Listening' : 'Idle';
  }

  if (commandHistoryListEl) {
    if (snapshot.commandHistory.length === 0) {
      commandHistoryListEl.innerHTML = '<li class="command-history__empty">No commands yet. Say “Hey Go” to begin.</li>';
    } else {
      commandHistoryListEl.innerHTML = snapshot.commandHistory
        .map((summary) => `<li class="command-history__item">${summary}</li>`)
        .join('');
    }
  }

  transcriptPanel.render(snapshot.transcript);
}

function setStatus(status: ListeningStatus): void {
  const snapshot = state.update((draft) => {
    draft.status = status;
  });
  renderFromSnapshot(snapshot);
}

function logTranscript(rawText: string, resultStatus: TranscriptResultStatus, message: string, command?: Command | null): void {
  const snapshot = transcriptLogger.log({
    rawText,
    command: command ?? null,
    result: {
      status: resultStatus,
      message,
    },
  });
  renderFromSnapshot(snapshot);
}

voiceBus.on('WAKE', () => {
  setStatus('LISTENING');
  commandRecognizer.capture();
});

commandBus.on('COMMAND_RECOGNIZED', ({ rawText }) => {
  const parseResult = parser.parse(rawText);
  if (!parseResult.ok) {
    logTranscript(rawText, 'ERROR', parseResult.message);
    return;
  }

  const { command } = parseResult;
  const executionResult = executor.execute(command);
  shell.boot();
  setStatus('IDLE');
  logTranscript(rawText, mapExecutionStatusToTranscriptStatus(executionResult.status), executionResult.message, command);
});

function mapExecutionStatusToTranscriptStatus(status: ExecutionStatus): TranscriptResultStatus {
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
(window as unknown as { soundGoSimulateWake?: () => void; soundGoSimulateCommand?: (text: string) => void }).soundGoSimulateWake =
  () => voiceListener.simulateWake();
(window as unknown as { soundGoSimulateCommand?: (text: string) => void }).soundGoSimulateCommand = (text: string) =>
  commandRecognizer.simulateRecognition(text);
