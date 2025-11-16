export type CommandType = 'MOUSE_MOVE_RELATIVE' | 'MOUSE_MOVE_ABSOLUTE' | 'MOUSE_CLICK' | 'MOUSE_DBLCLICK' | 'MOUSE_RIGHT_CLICK' | 'KEY_TYPE' | 'KEY_PRESS';
export type KeyModifier = 'CTRL' | 'SHIFT' | 'ALT';
export interface BaseCommand {
    type: CommandType;
    summary: string;
    /**
     * Raw transcript text that produced this command so downstream
     * consumers (transcript log, executor analytics) can trace
     * execution back to the heard phrase.
     */
    rawText: string;
}
export interface MouseMoveRelativeCommand extends BaseCommand {
    type: 'MOUSE_MOVE_RELATIVE';
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    distancePx: number;
}
export interface MouseMoveAbsoluteCommand extends BaseCommand {
    type: 'MOUSE_MOVE_ABSOLUTE';
    x: number;
    y: number;
}
export interface MouseClickCommand extends BaseCommand {
    type: 'MOUSE_CLICK' | 'MOUSE_DBLCLICK' | 'MOUSE_RIGHT_CLICK';
}
export interface KeyTypeCommand extends BaseCommand {
    type: 'KEY_TYPE';
    text: string;
}
export interface KeyPressCommand extends BaseCommand {
    type: 'KEY_PRESS';
    key: string;
    spokenKey: string;
    modifiers: KeyModifier[];
}
export type Command = MouseMoveRelativeCommand | MouseMoveAbsoluteCommand | MouseClickCommand | KeyTypeCommand | KeyPressCommand;
export type ParseErrorCode = 'EMPTY' | 'UNRECOGNIZED' | 'INVALID_NUMBER' | 'OUT_OF_RANGE' | 'UNSUPPORTED_KEY' | 'MISSING_ARGUMENT';
export interface ParseError {
    ok: false;
    code: ParseErrorCode;
    message: string;
    rawText: string;
}
export interface ParseSuccess {
    ok: true;
    command: Command;
}
export type ParseResult = ParseSuccess | ParseError;
//# sourceMappingURL=commands.d.ts.map