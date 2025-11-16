// WS3 — Command grammar & execution.

/**
 * Normalizes a spoken command transcript so downstream parsers can match
 * grammars without losing the original casing for transcript display.
 */
export interface NormalizedCommandText {
  /**
   * The command text after removing the wake phrase, preserving the
   * original casing for UI/transcript usage.
   */
  displayText: string;
  /**
   * Lower-cased version of {@link displayText} used for grammar matching.
   */
  matchableText: string;
  /**
   * Indicates whether the wake prefix ("Hey Go") was stripped.
   */
  wakePrefixRemoved: boolean;
}

const WAKE_PREFIX_PATTERN = /^hey\s+go[\s,;:-]*/i;

export function normalizeCommandText(rawText: string): NormalizedCommandText {
  const trimmed = rawText.trim();
  const withoutWake = trimmed.replace(WAKE_PREFIX_PATTERN, '');
  const displayText = withoutWake.trimStart();

  return {
    displayText,
    matchableText: displayText.toLowerCase(),
    wakePrefixRemoved: withoutWake.length !== trimmed.length,
  };
}
