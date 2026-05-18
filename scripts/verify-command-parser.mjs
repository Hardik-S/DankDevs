import assert from 'node:assert/strict';
import { CommandParser } from '../public/scripts/command/commandParser.js';

const parser = new CommandParser();

const supportedModifier = parser.parse('press control shift enter');
assert.equal(supportedModifier.ok, true);
assert.equal(supportedModifier.command.summary, 'Press CTRL+SHIFT+Enter');

const unsupportedModifier = parser.parse('press banana enter');
assert.equal(unsupportedModifier.ok, false);
assert.equal(unsupportedModifier.code, 'UNSUPPORTED_KEY');
assert.equal(unsupportedModifier.message, 'Modifier "banana" is not supported.');

console.log('Command parser verification passed.');
