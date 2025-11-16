export interface Win95Shell {
  desktopElement: HTMLElement;
  typeInFocusedWindow(text: string): void;
  focusDefault(): void;
}

export function createWin95Shell(container: HTMLElement): Win95Shell {
  const windowEl = document.createElement('div');
  windowEl.className = 'win95-window';

  const titleBar = document.createElement('div');
  titleBar.className = 'win95-window__titlebar';
  titleBar.textContent = 'VoicePad.txt - Notepad';

  const controls = document.createElement('div');
  controls.innerHTML = '<span>_</span> <span>[ ]</span> <span>X</span>';
  titleBar.appendChild(controls);

  const content = document.createElement('div');
  content.className = 'win95-window__content';

  const textarea = document.createElement('textarea');
  textarea.className = 'win95-window__textarea';
  textarea.value = 'Welcome to SoundGO!\nTry typing via voice commands.';
  content.appendChild(textarea);

  windowEl.appendChild(titleBar);
  windowEl.appendChild(content);

  const taskbar = document.createElement('div');
  taskbar.className = 'win95-taskbar';

  const startButton = document.createElement('button');
  startButton.className = 'win95-start-button';
  startButton.type = 'button';
  startButton.textContent = 'Start';

  const clock = document.createElement('div');
  clock.textContent = new Date().toLocaleTimeString();
  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString();
  }, 1000 * 30);

  taskbar.append(startButton, clock);

  container.append(windowEl, taskbar);

  function focusDefault() {
    textarea.focus();
  }

  function typeInFocusedWindow(text: string) {
    const selectionStart = textarea.selectionStart ?? textarea.value.length;
    const selectionEnd = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, selectionStart);
    const after = textarea.value.slice(selectionEnd);
    textarea.value = `${before}${text}${after}`;
    const caret = before.length + text.length;
    textarea.setSelectionRange(caret, caret);
    focusDefault();
  }

  focusDefault();

  return {
    desktopElement: container,
    typeInFocusedWindow,
    focusDefault
  };
}
