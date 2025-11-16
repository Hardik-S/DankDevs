// WS0 — Application bootstrap tying workstreams together.
import { State } from './core/state.js';
import { EventBus } from './core/events.js';
import { Win95Shell } from './ui/win95Shell.js';
import { TranscriptPanel } from './ui/transcriptPanel.js';
import { VoiceListener } from './voice/voiceListener.js';
import { CommandRecognizer } from './voice/commandRecognizer.js';
import { CommandParser } from './command/commandParser.js';
import { CommandExecutor } from './command/commandExecutor.js';
import type { TranscriptEntry } from './core/state.js';
import type { VoiceEvents } from './voice/voiceListener.js';
import type { CommandEvents } from './voice/commandRecognizer.js';
import type { Command } from './types/commands.js';

const state = new State();
const voiceBus = new EventBus<VoiceEvents>();
const commandBus = new EventBus<CommandEvents>();
const parser = new CommandParser();
const executor = new CommandExecutor(state);

const root = document.querySelector<HTMLElement>('.win95-shell');
const transcriptList = document.querySelector<HTMLUListElement>('#transcript');

if (!root || !transcriptList) {
  throw new Error('SoundGO root elements missing');
}

const shell = new Win95Shell({ root, state });
const transcriptPanel = new TranscriptPanel({ list: transcriptList, state });
const voiceListener = new VoiceListener(voiceBus);
const commandRecognizer = new CommandRecognizer(commandBus);

function appendTranscript(rawText: string, command: Command | null, result: string): void {
  state.update((draft) => {
    const entry: TranscriptEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      rawText,
      result,
    };

    if (command?.summary) {
      entry.parsedCommand = command.summary;
    }

    draft.transcript.unshift(entry);
  });
  transcriptPanel.render(state.snapshot.transcript);
}

voiceBus.on('WAKE', () => {
  commandRecognizer.capture();
});

commandBus.on('COMMAND_RECOGNIZED', ({ rawText }) => {
  const command = parser.parse(rawText);
  if (!command) {
    appendTranscript(rawText, null, 'Unrecognized command');
    return;
  }
  executor.execute(command);
  shell.boot();
  appendTranscript(rawText, command, 'Executed');
});

shell.boot();
voiceListener.start();

// Temporary helpers for manual simulation when no mic access is available.
(window as unknown as { soundGoSimulateWake?: () => void; soundGoSimulateCommand?: (text: string) => void }).soundGoSimulateWake =
  () => voiceListener.simulateWake();
(window as unknown as { soundGoSimulateCommand?: (text: string) => void }).soundGoSimulateCommand = (text: string) =>
  commandRecognizer.simulateRecognition(text);
