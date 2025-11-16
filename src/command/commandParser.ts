// WS3 — Command grammar & execution.
import type {
  Command,
  KeyModifier,
  MouseClickCommand,
  ParseError,
  ParseResult,
} from '../types/commands.js';
import { normalizeCommandText } from './transcriptNormalizer.js';

const RELATIVE_PATTERN = /^mouse\s+(left|right|up|down)\s+([\w\s-]+?)\s+pixels?$/i;
const ABSOLUTE_PATTERN = /^mouse\s+to\s+x\s+([\w\s-]+)\s+y\s+([\w\s-]+)$/i;
const TYPE_PREFIX_PATTERN = /^type\s+/i;
const KEY_PRESS_PREFIX_PATTERN = /^press\s+/i;
const TRAILING_PUNCTUATION = /[.!?]+$/;

const CLICK_SUMMARIES: Record<string, { type: MouseClickCommand['type']; summary: string }> = {
  'click': { type: 'MOUSE_CLICK', summary: 'Single click' },
  'double click': { type: 'MOUSE_DBLCLICK', summary: 'Double click' },
  'right click': { type: 'MOUSE_RIGHT_CLICK', summary: 'Right click' },
};

const MODIFIER_MAP: Record<string, KeyModifier> = {
  ctrl: 'CTRL',
  control: 'CTRL',
  shift: 'SHIFT',
  alt: 'ALT',
};

const KEY_NAME_MAP: Record<string, string> = {
  enter: 'Enter',
  return: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  space: ' ',
  spacebar: ' ',
  spacebarkey: ' ',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

const SPOKEN_NUMBER_MAP: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const MAGNITUDES: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
};

type ParseAttempt = Command | ParseError;

export class CommandParser {
  parse(rawText: string): ParseResult {
    const normalized = normalizeCommandText(rawText);
    const sanitized = this.sanitize(normalized.matchableText);

    if (!sanitized) {
      return this.createError('EMPTY', rawText, 'No command detected.');
    }

    const attempts: Array<ParseAttempt | null> = [
      this.parseMouseRelative(sanitized, rawText),
      this.parseMouseAbsolute(sanitized, rawText),
      this.parseClick(sanitized, rawText),
      this.parseKeyboardType(normalized.displayText, sanitized, rawText),
      this.parseKeyPress(sanitized, rawText),
    ];

    for (const attempt of attempts) {
      if (!attempt) continue;
      if (this.isParseError(attempt)) {
        return attempt;
      }
      return { ok: true, command: attempt };
    }

    return this.createError('UNRECOGNIZED', rawText, 'No matching command grammar found.');
  }

  private sanitize(text: string): string {
    return text.replace(TRAILING_PUNCTUATION, '').trim();
  }

  private parseMouseRelative(matchableText: string, rawText: string): ParseAttempt | null {
    const match = matchableText.match(RELATIVE_PATTERN);
    if (!match) {
      return null;
    }

    const directionWord = match[1];
    const distanceToken = match[2];
    if (!directionWord || !distanceToken) {
      return this.createError('UNRECOGNIZED', rawText, 'Command is missing direction or distance.');
    }
    const distancePx = this.parseNumber(distanceToken);
    if (distancePx === null) {
      return this.createError('INVALID_NUMBER', rawText, `Could not interpret distance "${distanceToken}".`);
    }

    if (distancePx <= 0) {
      return this.createError('OUT_OF_RANGE', rawText, 'Distance must be greater than zero.');
    }

    return {
      type: 'MOUSE_MOVE_RELATIVE',
      direction: directionWord.toUpperCase() as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
      distancePx,
      summary: `Move ${directionWord} ${distancePx}px`,
      rawText,
    };
  }

  private parseMouseAbsolute(matchableText: string, rawText: string): ParseAttempt | null {
    const match = matchableText.match(ABSOLUTE_PATTERN);
    if (!match) {
      return null;
    }

    const xToken = match[1];
    const yToken = match[2];
    if (!xToken || !yToken) {
      return this.createError('UNRECOGNIZED', rawText, 'Command is missing coordinates.');
    }
    const x = this.parseNumber(xToken);
    const y = this.parseNumber(yToken);

    if (x === null || y === null) {
      return this.createError('INVALID_NUMBER', rawText, 'Coordinates must be numeric.');
    }

    if (x < 0 || y < 0) {
      return this.createError('OUT_OF_RANGE', rawText, 'Coordinates cannot be negative.');
    }

    return {
      type: 'MOUSE_MOVE_ABSOLUTE',
      x,
      y,
      summary: `Move to (${x}, ${y})`,
      rawText,
    };
  }

  private parseClick(matchableText: string, rawText: string): ParseAttempt | null {
    const entry = CLICK_SUMMARIES[matchableText];
    if (!entry) {
      return null;
    }

    return {
      type: entry.type,
      summary: entry.summary,
      rawText,
    };
  }

  private parseKeyboardType(displayText: string, matchableText: string, rawText: string): ParseAttempt | null {
    if (!TYPE_PREFIX_PATTERN.test(matchableText)) {
      return null;
    }

    const prefixMatch = displayText.match(TYPE_PREFIX_PATTERN);
    const typedText = prefixMatch ? displayText.slice(prefixMatch[0].length).trim() : '';
    if (!typedText) {
      return this.createError('MISSING_ARGUMENT', rawText, 'Please provide text to type.');
    }

    return {
      type: 'KEY_TYPE',
      text: typedText,
      summary: `Type "${typedText}"`,
      rawText,
    };
  }

  private parseKeyPress(matchableText: string, rawText: string): ParseAttempt | null {
    if (!KEY_PRESS_PREFIX_PATTERN.test(matchableText)) {
      return null;
    }

    const spoken = matchableText.replace(KEY_PRESS_PREFIX_PATTERN, '').trim();
    if (!spoken) {
      return this.createError('MISSING_ARGUMENT', rawText, 'Please provide a key to press.');
    }

    const tokens = spoken.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return this.createError('MISSING_ARGUMENT', rawText, 'Please provide a key to press.');
    }

    const keyToken = tokens[tokens.length - 1];
    if (!keyToken) {
      return this.createError('MISSING_ARGUMENT', rawText, 'Please provide a key to press.');
    }
    const modifiers = this.extractModifiers(tokens.slice(0, -1));
    const key = this.parseKeyToken(keyToken);

    if (!key) {
      return this.createError('UNSUPPORTED_KEY', rawText, `Key "${keyToken}" is not supported.`);
    }

    const modifierPrefix = modifiers.length ? `${modifiers.join('+')}+` : '';
    const summaryKey = this.formatKeyLabel(key);

    return {
      type: 'KEY_PRESS',
      key,
      spokenKey: keyToken,
      modifiers,
      summary: `Press ${modifierPrefix}${summaryKey}`,
      rawText,
    };
  }

  private extractModifiers(tokens: string[]): KeyModifier[] {
    const modifiers: KeyModifier[] = [];
    for (const token of tokens) {
      const modifier = MODIFIER_MAP[token];
      if (modifier && !modifiers.includes(modifier)) {
        modifiers.push(modifier);
      }
    }
    return modifiers;
  }

  private parseKeyToken(token: string): string | null {
    const normalized = token.toLowerCase();
    if (KEY_NAME_MAP[normalized]) {
      return KEY_NAME_MAP[normalized];
    }

    if (/^f\d{1,2}$/.test(normalized)) {
      return normalized.toUpperCase();
    }

    if (/^[a-z0-9]$/.test(normalized)) {
      return normalized.toUpperCase();
    }

    return null;
  }

  private formatKeyLabel(key: string): string {
    if (key === ' ') {
      return 'Space';
    }

    if (key.startsWith('Arrow')) {
      return key;
    }

    if (key.length === 1) {
      return key.toUpperCase();
    }

    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  private parseNumber(token: string): number | null {
    const cleaned = token.replace(/[^a-z0-9\s-]/gi, '').replace(/-/g, ' ').replace(/\band\b/g, '').trim();
    if (!cleaned) {
      return null;
    }

    if (/^-?\d+$/.test(cleaned)) {
      return Number.parseInt(cleaned, 10);
    }

    const words = cleaned.split(/\s+/);
    let total = 0;
    let current = 0;

    for (const word of words) {
      if (word in SPOKEN_NUMBER_MAP) {
        const value = SPOKEN_NUMBER_MAP[word];
        if (typeof value === 'number') {
          current += value;
          continue;
        }
      }

      if (word in MAGNITUDES) {
        const magnitude = MAGNITUDES[word];
        if (typeof magnitude !== 'number') {
          return null;
        }
        if (magnitude === 100) {
          if (current === 0) {
            current = 1;
          }
          current *= magnitude;
          continue;
        }
        total += current * magnitude;
        current = 0;
        continue;
      }

      return null;
    }

    return total + current;
  }

  private isParseError(value: ParseAttempt): value is ParseError {
    return typeof value === 'object' && value !== null && 'ok' in value && value.ok === false;
  }

  private createError(code: ParseError['code'], rawText: string, message: string): ParseError {
    return { ok: false, code, message, rawText };
  }
}
