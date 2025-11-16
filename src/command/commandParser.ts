// WS3 — Command grammar & execution.
import type { Command } from '../types/commands.js';

const RELATIVE_PATTERN = /(left|right|up|down)\s+(\d+)/i;
const ABSOLUTE_PATTERN = /x\s*(\d+)\s*y\s*(\d+)/i;

export class CommandParser {
  parse(rawText: string): Command | null {
    const normalized = rawText.trim().toLowerCase();

    const relativeMatch = normalized.match(RELATIVE_PATTERN);
    if (relativeMatch) {
      const [, direction, distanceStr] = relativeMatch;
      if (!direction || !distanceStr) return null;
      return {
        type: 'MOUSE_MOVE_RELATIVE',
        direction: direction.toUpperCase() as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
        distance: Number(distanceStr),
        summary: `Move ${direction} ${distanceStr}px`,
      };
    }

    const absoluteMatch = normalized.match(ABSOLUTE_PATTERN);
    if (absoluteMatch) {
      const [, x, y] = absoluteMatch;
      if (!x || !y) return null;
      return {
        type: 'MOUSE_MOVE_ABSOLUTE',
        x: Number(x),
        y: Number(y),
        summary: `Move to (${x}, ${y})`,
      };
    }

    if (normalized.includes('double click')) {
      return { type: 'MOUSE_DOUBLE_CLICK', summary: 'Double click' };
    }

    if (normalized.includes('right click')) {
      return { type: 'MOUSE_RIGHT_CLICK', summary: 'Right click' };
    }

    if (normalized.includes('click')) {
      return { type: 'MOUSE_CLICK', summary: 'Click' };
    }

    if (normalized.startsWith('type ')) {
      return { type: 'KEYBOARD_TYPE', text: rawText.slice(5), summary: `Type "${rawText.slice(5)}"` };
    }

    return null;
  }
}
