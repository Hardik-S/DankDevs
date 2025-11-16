import { normalizeCommandText } from './transcriptNormalizer.js';
const RELATIVE_PATTERN = /(left|right|up|down)\s+(\d+)/i;
const ABSOLUTE_PATTERN = /x\s*(\d+)\s*y\s*(\d+)/i;
const TYPE_PREFIX_PATTERN = /^type\s+/i;
export class CommandParser {
    parse(rawText) {
        const { displayText, matchableText } = normalizeCommandText(rawText);
        if (!matchableText) {
            return null;
        }
        const relativeMatch = matchableText.match(RELATIVE_PATTERN);
        if (relativeMatch) {
            const [, direction, distanceStr] = relativeMatch;
            if (!direction || !distanceStr)
                return null;
            return {
                type: 'MOUSE_MOVE_RELATIVE',
                direction: direction.toUpperCase(),
                distance: Number(distanceStr),
                summary: `Move ${direction} ${distanceStr}px`,
            };
        }
        const absoluteMatch = matchableText.match(ABSOLUTE_PATTERN);
        if (absoluteMatch) {
            const [, x, y] = absoluteMatch;
            if (!x || !y)
                return null;
            return {
                type: 'MOUSE_MOVE_ABSOLUTE',
                x: Number(x),
                y: Number(y),
                summary: `Move to (${x}, ${y})`,
            };
        }
        if (matchableText.includes('double click')) {
            return { type: 'MOUSE_DOUBLE_CLICK', summary: 'Double click' };
        }
        if (matchableText.includes('right click')) {
            return { type: 'MOUSE_RIGHT_CLICK', summary: 'Right click' };
        }
        if (matchableText.includes('click')) {
            return { type: 'MOUSE_CLICK', summary: 'Click' };
        }
        if (matchableText.startsWith('type ')) {
            const prefixMatch = displayText.match(TYPE_PREFIX_PATTERN);
            const text = prefixMatch ? displayText.slice(prefixMatch[0].length) : '';
            return { type: 'KEYBOARD_TYPE', text, summary: `Type "${text}"` };
        }
        return null;
    }
}
//# sourceMappingURL=commandParser.js.map