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
export declare function normalizeCommandText(rawText: string): NormalizedCommandText;
//# sourceMappingURL=transcriptNormalizer.d.ts.map