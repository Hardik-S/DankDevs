export type CommandType =
  | 'MOUSE_MOVE_RELATIVE'
  | 'MOUSE_MOVE_ABSOLUTE'
  | 'CLICK'
  | 'DOUBLE_CLICK'
  | 'RIGHT_CLICK'
  | 'TYPE_TEXT';

export interface BaseCommand {
  type: CommandType;
}

export interface MouseMoveRelativeCommand extends BaseCommand {
  type: 'MOUSE_MOVE_RELATIVE';
  direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  distancePx: number;
}

export interface MouseMoveAbsoluteCommand extends BaseCommand {
  type: 'MOUSE_MOVE_ABSOLUTE';
  x: number;
  y: number;
}

export interface ClickCommand extends BaseCommand {
  type: 'CLICK' | 'DOUBLE_CLICK' | 'RIGHT_CLICK';
}

export interface TypeTextCommand extends BaseCommand {
  type: 'TYPE_TEXT';
  text: string;
}

export type Command =
  | MouseMoveRelativeCommand
  | MouseMoveAbsoluteCommand
  | ClickCommand
  | TypeTextCommand;
