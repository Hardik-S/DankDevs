import './styles/base.css';
import { defaultConfig } from './core/config';
import { createInitialState } from './core/state';
import { createEventBus } from './core/events';
import { createWin95Shell } from './ui/win95Shell';
import { createVirtualCursor } from './ui/virtualCursor';
import { createTranscriptPanel } from './ui/transcriptPanel';
import { createCommandParser } from './commands/commandParser';
import { createCommandExecutor } from './commands/commandExecutor';
import { createVoiceListener } from './voice/voiceListener';
import { createCommandRecognizer } from './voice/commandRecognizer';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('#app not found');
}

const desktopContainer = document.createElement('div');
desktopContainer.className = 'app__desktop';
desktopContainer.style.minHeight = `${defaultConfig.desktopHeight}px`;
desktopContainer.style.minWidth = `${defaultConfig.desktopWidth}px`;

const panelContainer = document.createElement('div');
panelContainer.className = 'app__panel';

appRoot.append(desktopContainer, panelContainer);

const state = createInitialState(defaultConfig);
const events = createEventBus();
const shell = createWin95Shell(desktopContainer);
const virtualCursor = createVirtualCursor(shell.desktopElement, state, defaultConfig);
const transcriptPanel = createTranscriptPanel(panelContainer, defaultConfig);
const parser = createCommandParser(defaultConfig);
const executor = createCommandExecutor({ virtualCursor, shell });
const voiceListener = createVoiceListener(events);
const recognizer = createCommandRecognizer(events);

recognizer.onCommand((rawText) => {
  voiceListener.setStatus('listening');
  const timestamp = new Date();
  const parseResult = parser.parse(rawText.replace(/^hey\s+go[,\s]*/i, ''));

  if (!parseResult.success) {
    transcriptPanel.logEvent({
      timestamp,
      rawText,
      parsedCommandSummary: '—',
      result: `ERROR: ${parseResult.error}`
    });
    voiceListener.setStatus('idle');
    return;
  }

  const execResult = executor.execute(parseResult.command);
  transcriptPanel.logEvent({
    timestamp,
    rawText,
    parsedCommandSummary: parseResult.summary,
    result: execResult.success ? execResult.message ?? 'OK' : `ERROR: ${execResult.error}`
  });
  voiceListener.setStatus(execResult.success ? 'executing' : 'idle');
  setTimeout(() => voiceListener.setStatus('idle'), 600);
});

transcriptPanel.onCommandSubmit((value) => {
  recognizer.ingest(value);
});

events.on('voice:status', (status) => {
  transcriptPanel.setStatus(status);
});
