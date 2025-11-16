// WS4 — Shared state & typings.
export type CommandType =
  | 'MOUSE_MOVE_RELATIVE'
  | 'MOUSE_MOVE_ABSOLUTE'
  | 'MOUSE_CLICK'
  | 'MOUSE_DOUBLE_CLICK'
  | 'MOUSE_RIGHT_CLICK'
  | 'KEYBOARD_TYPE';

export interface BaseCommand {
  type: CommandType;
  summary: string;
}

export interface MouseMoveRelativeCommand extends BaseCommand {
  type: 'MOUSE_MOVE_RELATIVE';
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  distance: number;
}

export interface MouseMoveAbsoluteCommand extends BaseCommand {
  type: 'MOUSE_MOVE_ABSOLUTE';
  x: number;
  y: number;
}

export interface MouseClickCommand extends BaseCommand {
  type: 'MOUSE_CLICK' | 'MOUSE_DOUBLE_CLICK' | 'MOUSE_RIGHT_CLICK';
}

export interface KeyboardTypeCommand extends BaseCommand {
  type: 'KEYBOARD_TYPE';
  text: string;
}

export type Command =
  | MouseMoveRelativeCommand
  | MouseMoveAbsoluteCommand
  | MouseClickCommand
  | KeyboardTypeCommand;
