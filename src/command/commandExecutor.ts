// WS3 — Command grammar & execution.
import type {
  Command,
  KeyModifier,
  KeyPressCommand,
  KeyTypeCommand,
  MouseClickCommand,
  MouseMoveAbsoluteCommand,
  MouseMoveRelativeCommand,
} from '../types/commands.js';
import type { State } from '../core/state.js';
import { WORKSPACE_DIMENSIONS } from '../core/config.js';

export type ExecutionStatus =
  | 'SUCCESS'
  | 'SUCCESS_WITH_CLAMP'
  | 'ERROR_NO_TARGET'
  | 'ERROR_NO_FOCUS'
  | 'ERROR_ENVIRONMENT'
  | 'ERROR_UNSUPPORTED_COMMAND';

export interface ExecutionResult {
  status: ExecutionStatus;
  message: string;
  targetDescription?: string;
}

type ViewportPoint = { x: number; y: number };

type TextAcceptingElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

const MODIFIER_LABEL_MAP: Record<KeyModifier, { key: string; code: string }> = {
  CTRL: { key: 'Control', code: 'ControlLeft' },
  SHIFT: { key: 'Shift', code: 'ShiftLeft' },
  ALT: { key: 'Alt', code: 'AltLeft' },
};

const CLICK_ACTION_LABEL: Record<MouseClickCommand['type'], string> = {
  MOUSE_CLICK: 'Clicked',
  MOUSE_DBLCLICK: 'Double-clicked',
  MOUSE_RIGHT_CLICK: 'Right-clicked',
};

export class CommandExecutor {
  constructor(private state: State) {}

  execute(command: Command): ExecutionResult {
    switch (command.type) {
      case 'MOUSE_MOVE_RELATIVE':
        return this.handleMouseMoveRelative(command);
      case 'MOUSE_MOVE_ABSOLUTE':
        return this.handleMouseMoveAbsolute(command);
      case 'MOUSE_CLICK':
      case 'MOUSE_DBLCLICK':
      case 'MOUSE_RIGHT_CLICK':
        return this.handleMouseClick(command);
      case 'KEY_TYPE':
        return this.handleKeyType(command);
      case 'KEY_PRESS':
        return this.handleKeyPress(command);
      default:
        return this.createResult('ERROR_UNSUPPORTED_COMMAND', 'Unsupported command type.');
    }
  }

  private handleMouseMoveRelative(command: MouseMoveRelativeCommand): ExecutionResult {
    let clamped = false;
    this.state.update((draft) => {
      const cursor = draft.cursor;
      const delta = command.distancePx;
      if (command.direction === 'LEFT') cursor.x -= delta;
      if (command.direction === 'RIGHT') cursor.x += delta;
      if (command.direction === 'UP') cursor.y -= delta;
      if (command.direction === 'DOWN') cursor.y += delta;

      const clampedX = this.clamp(cursor.x, 0, WORKSPACE_DIMENSIONS.width);
      const clampedY = this.clamp(cursor.y, 0, WORKSPACE_DIMENSIONS.height);
      clamped = clamped || clampedX !== cursor.x || clampedY !== cursor.y;
      cursor.x = clampedX;
      cursor.y = clampedY;
      draft.lastCommand = command;
    });

    const direction = command.direction.toLowerCase();
    const baseMessage = `Moved cursor ${direction} ${command.distancePx}px.`;
    return this.createResult(
      clamped ? 'SUCCESS_WITH_CLAMP' : 'SUCCESS',
      clamped ? `${baseMessage} Clamped to workspace edges.` : baseMessage,
    );
  }

  private handleMouseMoveAbsolute(command: MouseMoveAbsoluteCommand): ExecutionResult {
    let clamped = false;
    this.state.update((draft) => {
      const nextX = this.clamp(command.x, 0, WORKSPACE_DIMENSIONS.width);
      const nextY = this.clamp(command.y, 0, WORKSPACE_DIMENSIONS.height);
      clamped = clamped || nextX !== command.x || nextY !== command.y;
      draft.cursor.x = nextX;
      draft.cursor.y = nextY;
      draft.lastCommand = command;
    });

    const baseMessage = `Moved cursor to (${command.x}, ${command.y}).`;
    return this.createResult(
      clamped ? 'SUCCESS_WITH_CLAMP' : 'SUCCESS',
      clamped ? `${baseMessage} Clamped within workspace.` : baseMessage,
    );
  }

  private handleMouseClick(command: MouseClickCommand): ExecutionResult {
    const doc = this.getDocument();
    if (!doc) {
      return this.createResult('ERROR_ENVIRONMENT', 'Click commands require a browser environment.');
    }

    const hitTest = this.getHitTarget(doc);
    const target = hitTest?.element ?? null;
    if (!target) {
      this.recordLastCommand(command);
      return this.createResult('ERROR_NO_TARGET', 'No clickable target beneath the virtual cursor.');
    }

    this.dispatchClickSequence(target, command.type, hitTest.point);
    this.focusElement(target);
    this.recordLastCommand(command);

    const description = this.describeElement(target, doc);
    const action = CLICK_ACTION_LABEL[command.type];
    return { status: 'SUCCESS', message: `${action} ${description}.`, targetDescription: description };
  }

  private handleKeyType(command: KeyTypeCommand): ExecutionResult {
    const doc = this.getDocument();
    if (!doc) {
      return this.createResult('ERROR_ENVIRONMENT', 'Typing commands require a browser document.');
    }

    const target = doc.activeElement;
    if (!this.isTextAcceptingElement(target)) {
      return this.createResult('ERROR_NO_FOCUS', 'No focused text field available for typing.');
    }

    this.injectText(target, command.text);
    this.recordLastCommand(command);

    const description = this.describeElement(target, doc);
    const snippet = this.truncate(command.text, 40);
    return { status: 'SUCCESS', message: `Typed "${snippet}" into ${description}.`, targetDescription: description };
  }

  private handleKeyPress(command: KeyPressCommand): ExecutionResult {
    const doc = this.getDocument();
    if (!doc) {
      return this.createResult('ERROR_ENVIRONMENT', 'Key press commands require a browser document.');
    }

    const target = doc.activeElement;
    if (!(target instanceof HTMLElement)) {
      return this.createResult('ERROR_NO_FOCUS', 'No focused element available for key press.');
    }

    this.dispatchKeyCombo(target, command);
    this.recordLastCommand(command);

    const description = this.describeElement(target, doc);
    return {
      status: 'SUCCESS',
      message: `Sent "${command.summary}" to ${description}.`,
      targetDescription: description,
    };
  }

  private recordLastCommand(command: Command): void {
    this.state.update((draft) => {
      draft.lastCommand = command;
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private getDocument(): Document | null {
    if (typeof document === 'undefined') {
      return null;
    }
    return document;
  }

  private getWorkspaceElement(doc: Document): HTMLElement | null {
    return doc.querySelector<HTMLElement>('.desktop-pane');
  }

  private getCursorViewportPoint(doc: Document): ViewportPoint | null {
    const workspace = this.getWorkspaceElement(doc);
    if (!workspace) {
      return null;
    }

    const rect = workspace.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return null;
    }

    const cursor = this.state.snapshot.cursor;
    const normalizedX = WORKSPACE_DIMENSIONS.width === 0 ? 0 : this.clamp(cursor.x, 0, WORKSPACE_DIMENSIONS.width) / WORKSPACE_DIMENSIONS.width;
    const normalizedY = WORKSPACE_DIMENSIONS.height === 0 ? 0 : this.clamp(cursor.y, 0, WORKSPACE_DIMENSIONS.height) / WORKSPACE_DIMENSIONS.height;
    return {
      x: rect.left + rect.width * normalizedX,
      y: rect.top + rect.height * normalizedY,
    };
  }

  private getHitTarget(doc: Document): { element: Element | null; point: ViewportPoint | null } {
    const point = this.getCursorViewportPoint(doc);
    if (!point || !doc.elementsFromPoint) {
      return { element: null, point };
    }

    const elements = doc.elementsFromPoint(point.x, point.y);
    const target = elements.find((element) => {
      if (!(element instanceof HTMLElement)) {
        return true;
      }
      return element.dataset.cursor !== 'middle-finger';
    });

    return { element: target ?? null, point };
  }

  private dispatchClickSequence(target: Element, type: MouseClickCommand['type'], point: ViewportPoint | null): void {
    const button = type === 'MOUSE_RIGHT_CLICK' ? 2 : 0;
    const mouseInit = this.createMouseEventInit(point, button);

    this.dispatchPointerEvent(target, 'pointerdown', mouseInit);
    this.dispatchMouseEvent(target, 'mousedown', mouseInit);
    this.dispatchPointerEvent(target, 'pointerup', mouseInit);
    this.dispatchMouseEvent(target, 'mouseup', mouseInit);

    if (type !== 'MOUSE_RIGHT_CLICK') {
      this.dispatchMouseEvent(target, 'click', mouseInit);
    }

    if (type === 'MOUSE_DBLCLICK') {
      this.dispatchPointerEvent(target, 'pointerdown', mouseInit);
      this.dispatchMouseEvent(target, 'mousedown', mouseInit);
      this.dispatchPointerEvent(target, 'pointerup', mouseInit);
      this.dispatchMouseEvent(target, 'mouseup', mouseInit);
      this.dispatchMouseEvent(target, 'click', mouseInit);
      this.dispatchMouseEvent(target, 'dblclick', mouseInit);
    }

    if (type === 'MOUSE_RIGHT_CLICK') {
      this.dispatchMouseEvent(target, 'contextmenu', mouseInit);
    }
  }

  private dispatchPointerEvent(target: Element, type: string, init: PointerEventInit): void {
    if (typeof PointerEvent === 'undefined') {
      return;
    }
    target.dispatchEvent(new PointerEvent(type, { ...init, bubbles: true, cancelable: true }));
  }

  private dispatchMouseEvent(target: Element, type: string, init: PointerEventInit): void {
    target.dispatchEvent(new MouseEvent(type, { ...init, bubbles: true, cancelable: true }));
  }

  private createMouseEventInit(point: ViewportPoint | null, button: number): PointerEventInit {
    return {
      button,
      clientX: point?.x ?? 0,
      clientY: point?.y ?? 0,
    };
  }

  private focusElement(element: Element): void {
    if (element instanceof HTMLElement && typeof element.focus === 'function') {
      try {
        element.focus({ preventScroll: true });
      } catch {
        element.focus();
      }
    }
  }

  private isTextAcceptingElement(element: Element | null): element is TextAcceptingElement {
    if (!element) {
      return false;
    }
    if (element instanceof HTMLTextAreaElement) {
      return true;
    }
    if (element instanceof HTMLInputElement) {
      const nonTextTypes = new Set([
        'button',
        'checkbox',
        'color',
        'date',
        'datetime-local',
        'file',
        'image',
        'month',
        'radio',
        'range',
        'reset',
        'submit',
        'time',
        'week',
      ]);
      const type = element.type ? element.type.toLowerCase() : 'text';
      return !nonTextTypes.has(type);
    }
    return element instanceof HTMLElement && element.isContentEditable;
  }

  private injectText(element: TextAcceptingElement, text: string): void {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      const start = element.selectionStart ?? element.value.length;
      const end = element.selectionEnd ?? element.value.length;
      const nextValue = element.value.slice(0, start) + text + element.value.slice(end);
      element.value = nextValue;
      const caret = start + text.length;
      if (typeof element.setSelectionRange === 'function') {
        element.setSelectionRange(caret, caret);
      }
      const inputEvent = typeof InputEvent !== 'undefined'
        ? new InputEvent('input', { data: text, inputType: 'insertText', bubbles: true })
        : new Event('input', { bubbles: true });
      element.dispatchEvent(inputEvent);
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    if (element instanceof HTMLElement && element.isContentEditable) {
      element.focus();
      const doc = this.getDocument();
      doc?.execCommand('insertText', false, text);
    }
  }

  private dispatchKeyCombo(target: HTMLElement, command: KeyPressCommand): void {
    const modifiers = [...command.modifiers];
    for (const modifier of modifiers) {
      const init = this.createModifierKeyboardInit(modifier);
      target.dispatchEvent(new KeyboardEvent('keydown', init));
    }

    const keyInit = this.createKeyboardInit(command.key, modifiers);
    target.dispatchEvent(new KeyboardEvent('keydown', keyInit));
    target.dispatchEvent(new KeyboardEvent('keyup', keyInit));

    for (let index = modifiers.length - 1; index >= 0; index -= 1) {
      const modifier = modifiers[index];
      if (!modifier) {
        continue;
      }
      const init = this.createModifierKeyboardInit(modifier);
      target.dispatchEvent(new KeyboardEvent('keyup', init));
    }
  }

  private createModifierKeyboardInit(modifier: KeyModifier): KeyboardEventInit {
    const base = MODIFIER_LABEL_MAP[modifier];
    return {
      key: base.key,
      code: base.code,
      bubbles: true,
      cancelable: true,
      ctrlKey: modifier === 'CTRL',
      shiftKey: modifier === 'SHIFT',
      altKey: modifier === 'ALT',
      repeat: false,
    } satisfies KeyboardEventInit;
  }

  private createKeyboardInit(key: string, modifiers: KeyModifier[]): KeyboardEventInit {
    return {
      key,
      code: this.formatKeyCode(key),
      bubbles: true,
      cancelable: true,
      ctrlKey: modifiers.includes('CTRL'),
      shiftKey: modifiers.includes('SHIFT'),
      altKey: modifiers.includes('ALT'),
      repeat: false,
    } satisfies KeyboardEventInit;
  }

  private describeElement(element: Element, doc: Document): string {
    if (!(element instanceof HTMLElement)) {
      return element.tagName.toLowerCase();
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel;
    }
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = doc.getElementById(labelledBy);
      if (labelEl?.textContent) {
        return labelEl.textContent.trim();
      }
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.placeholder) {
        return element.placeholder;
      }
      if (element.id) {
        const label = doc.querySelector(`label[for="${element.id}"]`);
        if (label?.textContent) {
          return label.textContent.trim();
        }
      }
    }
    if (element.id) {
      return `#${element.id}`;
    }
    const text = element.textContent?.trim();
    if (text) {
      return this.truncate(text.replace(/\s+/g, ' '), 60);
    }
    return element.tagName.toLowerCase();
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1)}…`;
  }

  private formatKeyCode(key: string): string {
    if (key === ' ') {
      return 'Space';
    }
    if (/^[a-z]$/i.test(key)) {
      return `Key${key.toUpperCase()}`;
    }
    if (/^\d$/.test(key)) {
      return `Digit${key}`;
    }
    return key;
  }

  private createResult(status: ExecutionStatus, message: string): ExecutionResult {
    return { status, message };
  }
}
