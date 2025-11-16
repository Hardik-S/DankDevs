# PLAN_SOUND — Sound Command Functionalities

> Workstream Reference: WS2 (Voice Input) + WS3 (Command Grammar & Execution)
>
> Source of truth: `MASTERPLAN.md`

## 1. Purpose

Document concrete behaviors, validation rules, and system interactions for every **sound-driven command** in SoundGO. Implementers in WS2/WS3 should use this as the functional contract when wiring wake phrase handling, speech parsing, and downstream command execution.

## 2. Command Lifecycle Overview

1. **Wake Phrase Detection (WS2)**
   - VoiceListener monitors audio input for the phrase **"Hey Go"** (case-insensitive).
   - On detection, raise `onWake()` and transition status to *Listening*.
2. **Command Capture (WS2)**
   - CommandRecognizer captures the utterance immediately following the wake phrase (`"Hey Go, <command>"`).
   - Provide the raw transcript string to WS3 via `onCommandText(rawText)`.
3. **Parsing & Validation (WS3)**
   - CommandParser trims the wake prefix, normalizes whitespace, and matches against the grammar defined below.
   - Produce a typed command object that conforms to the interfaces in section 3.3 of `MASTERPLAN.md`.
   - On parse failure, emit an `ERROR_UNRECOGNIZED` result without calling CommandExecutor.
4. **Execution (WS3)**
   - CommandExecutor receives the typed command, performs bounds checking, and invokes the relevant UI/Core APIs (virtual cursor, keyboard, transcript logging).
   - Execution results must always be logged to the transcript panel (WS5) with timestamp, raw text, parsed summary, and success/error status.

## 3. Functional Breakdown by Command Family

### 3.1 Activation / Wake Phrase
- **Trigger Phrase:** `"Hey Go"`.
- **Expected Behavior:**
  - Transition system status indicator to `Listening`.
  - Arm the recognizer for a single command utterance.
- **Constraints:**
  - Ignore duplicate wake detections while already listening (debounce ~1.5s window).
  - Reset to Idle if no command audio is captured within the configured timeout (default 5s).

### 3.2 Mouse Relative Movement
- **Grammar:** `mouse (left|right|up|down) <distance> (pixel|pixels)`.
- **Parsed Type:** `MOUSE_MOVE_RELATIVE` with `direction` + `distancePx` (integer > 0).
- **Execution Rules:**
  - Convert speech numbers to integers (support at least 0–1000).
  - Movement occurs relative to the current virtual cursor position inside the Win95 shell bounds.
  - Clamp results to the desktop rectangle; log if clamping occurred (Result `SUCCESS_WITH_CLAMP`).
- **Sample Transcript Entry:**
  - `Raw: "mouse left 230 pixels" → Parsed: mouse left 230px → Result: moved 230px left (clamped?).`

### 3.3 Mouse Absolute Movement
- **Grammar:** `mouse to x <xCoord> y <yCoord>`.
- **Parsed Type:** `MOUSE_MOVE_ABSOLUTE` with `x`, `y` (integers ≥ 0).
- **Execution Rules:**
  - Coordinates reference the Win95 shell coordinate system (0,0 at top-left of left panel).
  - Clamp within shell width/height.
  - Optionally animate cursor movement for UX (non-blocking).

### 3.4 Click Commands
- **Grammars & Types:**
  - `click` → `MOUSE_CLICK`
  - `double click` → `MOUSE_DBLCLICK`
  - `right click` → `MOUSE_RIGHT_CLICK`
- **Execution Rules:**
  - `MOUSE_CLICK`: dispatch a standard left-click event at current cursor location.
  - `MOUSE_DBLCLICK`: dispatch two left-click events with minimal delay to trigger double-click handlers.
  - `MOUSE_RIGHT_CLICK`: dispatch context-menu event and ensure UI handles/blocks browser default menus as needed.
- **Feedback:** Always log which UI element (if any) was targeted; if no element handled the click, mark result as `NO_TARGET` but still success.

### 3.5 Typing Command
- **Grammar:** `type <text>` (text can include spaces, punctuation until pause/end).
- **Parsed Type:** `KEY_TYPE` with payload string.
- **Execution Rules:**
  - Require a focused input/textarea/window area; if none, log error `NO_FOCUS`.
  - Inject characters sequentially using the virtual keyboard API to trigger downstream events.
  - Preserve case and punctuation as dictated by speech recognizer output.

### 3.6 Key Press Command (Optional v1 extension)
- **Grammar:** `press <key>` or `press <modifier> <key>` (e.g., `press enter`, `press control c`).
- **Parsed Type:** `KEY_PRESS` with `key` plus optional modifiers array.
- **Execution Rules:**
  - Map spoken key names to KeyboardEvent codes (enter, escape, tab, delete, etc.).
  - For combos, fire keydown (modifier), keydown (key), keyup (key), keyup (modifier) in order.
  - If an unsupported key is requested, respond with `ERROR_UNSUPPORTED_KEY`.

## 4. Error & Recovery Logic

| Scenario | Detection Layer | Transcript Result | Recovery |
| --- | --- | --- | --- |
| Wake phrase detected but no command captured | WS2 | `ERROR (No command heard)` | Reset to Idle, prompt user visually. |
| Utterance fails grammar match | WS3 parser | `ERROR (Unrecognized command)` | Stay Idle, no state change. |
| Coordinates/Distances invalid | WS3 executor | `ERROR (Out of bounds)` or `SUCCESS_WITH_CLAMP` | Clamp or reject per rules above. |
| Click/Type without valid target | WS3 executor | `ERROR (No focus / No target)` | Suggest focusing a window via transcript note. |

## 5. Interfaces & Events Checklist

- `VoiceListener` → emits `onWake()`.
- `CommandRecognizer` → emits `onCommandText(raw: string)`.
- `CommandParser` → exports `parse(raw: string): Command | ParseError`.
- `CommandExecutor` → exports `execute(command: Command): ExecutionResult`.
- `TranscriptLogger` → `logEvent({ timestamp, rawText, parsedSummary, result })` for every attempt (success/failure).

## 6. Implementation Notes

1. **Normalization:** lower-case only for matching; retain original casing for transcript display.
2. **Number Parsing:** support both digits and spoken numerals ("one hundred"). Document any limitations in transcript metadata.
3. **Timeouts:** listening window (wake → command) defaults to 5 seconds; configurable via `src/core/config.ts`.
4. **Extensibility:** future sound commands (scroll, drag) should follow same parse/execute/log structure and extend the command type union in `MASTERPLAN.md`.

## 7. 7x3 Checklist of End-to-End Steps

| Step | Owner / Module | Status |
| --- | --- | --- |
| [ ] 1. Ready microphone pipeline | WS2 — VoiceListener ensures permissions + idle baseline | Pending |
| [ ] 2. Detect wake phrase "Hey Go" | WS2 — VoiceListener raises `onWake()` and debounces repeats | Pending |
| [ ] 3. Capture immediate utterance | WS2 — CommandRecognizer buffers post-wake speech and emits raw text | Pending |
| [ ] 4. Normalize transcript | WS3 — Parser trims wake words, lowercases for matching, preserves display casing | Pending |
| [ ] 5. Parse into typed command | WS3 — CommandParser validates grammar and returns command object or error | Pending |
| [ ] 6. Execute command | WS3 — CommandExecutor clamps values, drives virtual mouse/keyboard, handles errors | Pending |
| [ ] 7. Log outcome to transcript | WS5 — TranscriptLogger records timestamp, raw text, parsed summary, result | Pending |

---

_Last updated: synced with MASTERPLAN.md v1.0._
