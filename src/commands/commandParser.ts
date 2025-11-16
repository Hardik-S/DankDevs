import type { AppConfig } from '../core/config';
import type { Command, MouseMoveAbsoluteCommand, MouseMoveRelativeCommand, TypeTextCommand } from './commandTypes';

export interface ParseSuccess {
  success: true;
  command: Command;
  summary: string;
}

export interface ParseFailure {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

export function createCommandParser(_config: AppConfig) {
  function parse(rawText: string): ParseResult {
    const cleaned = rawText.trim().toLowerCase();
    if (!cleaned) {
      return { success: false, error: 'No speech detected' };
    }

    const relativeMatch = cleaned.match(/mouse\s+(left|right|up|down)\s+(\d+)\s+pixel/);
    if (relativeMatch) {
      const [, direction, distance] = relativeMatch;
      const command: MouseMoveRelativeCommand = {
        type: 'MOUSE_MOVE_RELATIVE',
        direction: direction.toUpperCase() as MouseMoveRelativeCommand['direction'],
        distancePx: Number(distance)
      };
      return {
        success: true,
        command,
        summary: `${command.type}(${command.direction}, ${command.distancePx})`
      };
    }

    const absoluteMatch = cleaned.match(/mouse\s+to\s+x\s+(\d+)\s+y\s+(\d+)/);
    if (absoluteMatch) {
      const [, x, y] = absoluteMatch;
      const command: MouseMoveAbsoluteCommand = {
        type: 'MOUSE_MOVE_ABSOLUTE',
        x: Number(x),
        y: Number(y)
      };
      return {
        success: true,
        command,
        summary: `${command.type}(${command.x}, ${command.y})`
      };
    }

    if (cleaned.includes('double click')) {
      return {
        success: true,
        command: { type: 'DOUBLE_CLICK' },
        summary: 'DOUBLE_CLICK'
      };
    }

    if (cleaned.includes('right click')) {
      return {
        success: true,
        command: { type: 'RIGHT_CLICK' },
        summary: 'RIGHT_CLICK'
      };
    }

    if (cleaned.includes('click')) {
      return {
        success: true,
        command: { type: 'CLICK' },
        summary: 'CLICK'
      };
    }

    const typeMatch = cleaned.match(/type\s+(.+)/);
    if (typeMatch) {
      const [, text] = typeMatch;
      const command: TypeTextCommand = {
        type: 'TYPE_TEXT',
        text
      };
      return {
        success: true,
        command,
        summary: `${command.type}(${command.text})`
      };
    }

    return { success: false, error: 'Unrecognized command' };
  }

  return { parse };
}
