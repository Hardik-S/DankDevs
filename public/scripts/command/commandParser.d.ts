import type { ParseResult } from '../types/commands.js';
export declare class CommandParser {
    parse(rawText: string): ParseResult;
    private sanitize;
    private parseMouseRelative;
    private parseMouseAbsolute;
    private parseClick;
    private parseKeyboardType;
    private parseKeyPress;
    private extractModifiers;
    private parseKeyToken;
    private formatKeyLabel;
    private parseNumber;
    private isParseError;
    private createError;
}
//# sourceMappingURL=commandParser.d.ts.map