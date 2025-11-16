// WS3 — Command grammar & execution.
const WAKE_PREFIX_PATTERN = /^hey\s+go[\s,;:-]*/i;
export function normalizeCommandText(rawText) {
    const trimmed = rawText.trim();
    const withoutWake = trimmed.replace(WAKE_PREFIX_PATTERN, '');
    const displayText = withoutWake.trimStart();
    return {
        displayText,
        matchableText: displayText.toLowerCase(),
        wakePrefixRemoved: withoutWake.length !== trimmed.length,
    };
}
//# sourceMappingURL=transcriptNormalizer.js.map