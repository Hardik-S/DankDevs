import type { AppConfig } from '../core/config';
import type { ListenerStatus } from '../core/state';

export interface TranscriptEntry {
  timestamp: Date;
  rawText: string;
  parsedCommandSummary: string;
  result: string;
}

export interface TranscriptPanel {
  element: HTMLElement;
  setStatus(status: ListenerStatus): void;
  logEvent(entry: TranscriptEntry): void;
  onCommandSubmit(handler: (rawText: string) => void): void;
}

export function createTranscriptPanel(container: HTMLElement, config: AppConfig): TranscriptPanel {
  const statusSection = document.createElement('section');
  statusSection.className = 'panel__section';
  const statusHeading = document.createElement('h2');
  statusHeading.textContent = 'Status';
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'status-indicator';
  const statusDot = document.createElement('span');
  statusDot.className = 'status-dot';
  statusDot.dataset.state = 'idle';
  const statusText = document.createElement('span');
  statusText.textContent = 'Idle';
  statusIndicator.append(statusDot, statusText);
  statusSection.append(statusHeading, statusIndicator);

  const referenceSection = document.createElement('section');
  referenceSection.className = 'panel__section command-reference';
  const referenceHeading = document.createElement('h2');
  referenceHeading.textContent = 'Command Reference';
  const referenceList = document.createElement('ul');
  config.commandReference.forEach((command) => {
    const item = document.createElement('li');
    item.textContent = command;
    referenceList.appendChild(item);
  });
  referenceSection.append(referenceHeading, referenceList);

  const transcriptLog = document.createElement('div');
  transcriptLog.className = 'transcript-log';

  const commandForm = document.createElement('form');
  commandForm.className = 'command-form';
  const formLabel = document.createElement('label');
  formLabel.textContent = 'Manual command (debug input)';
  formLabel.setAttribute('for', 'command-input');
  const commandInput = document.createElement('input');
  commandInput.id = 'command-input';
  commandInput.placeholder = 'e.g. Hey Go, mouse left 200 pixels';
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Send';
  commandForm.append(formLabel, commandInput, submitButton);

  container.append(statusSection, referenceSection, transcriptLog, commandForm);

  let submitHandler: ((rawText: string) => void) | null = null;

  commandForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = commandInput.value.trim();
    if (!value || !submitHandler) {
      return;
    }
    submitHandler(value);
    commandInput.value = '';
  });

  return {
    element: container,
    setStatus(status) {
      statusDot.dataset.state = status;
      statusText.textContent = status === 'idle' ? 'Idle' : status === 'listening' ? 'Listening' : 'Executing';
    },
    logEvent(entry) {
      const row = document.createElement('div');
      row.className = 'transcript-entry';
      row.innerHTML = `
        <div>[${entry.timestamp.toLocaleTimeString()}]</div>
        <div>Raw: ${entry.rawText}</div>
        <div>Parsed: ${entry.parsedCommandSummary}</div>
        <div>Result: ${entry.result}</div>
      `;
      transcriptLog.prepend(row);
    },
    onCommandSubmit(handler) {
      submitHandler = handler;
    }
  };
}
