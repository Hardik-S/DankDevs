1. **Task & success criteria**
   1.1 Create a single `MASTERPLAN.md` that every AI/dev must read before working on **SoundGO**.
   1.2 The file must define scope, constraints, architecture, command grammar, layout, and workstreams so independent agents can contribute without conflict.

2. **Plan**
   2.1 Define project scope, constraints, and non-goals.
   2.2 Specify UI layout (3/4 Win95 emulator + 1/4 control/transcript pane).
   2.3 Define voice pipeline: activation, recognition, parsing, execution, logging.
   2.4 Define module boundaries, folder structure, and interfaces so work can be parallelized.
   2.5 List milestones and conventions.
   2.6 Package everything as `MASTERPLAN.md` in markdown.

3. **MASTERPLAN.md**

````markdown
# MASTERPLAN — SoundGO

> This document **must be read and followed by every AI agent and developer** before touching the codebase.

---

## 1. Project Summary

1.1 **Name:** SoundGO  
1.2 **Goal:**  
Create a **web-based Windows 95–style environment** where the user controls a **virtual mouse and keyboard entirely by voice** using the wake phrase **“Hey Go”** and natural language commands (e.g., “mouse left 230 pixels”).  

1.3 **Hosting & Platform Constraints**

- The project is hosted on **GitHub Pages** → **static site only** (HTML/CSS/JS/TS, assets).
- All behavior is implemented client-side in the browser.
- Voice control manipulates a **virtual mouse and keyboard inside the web app**, not the user’s actual OS.

1.4 **High-Level UX**

- Left **3/4 of the viewport**:  
  - A **Windows 95–like desktop** (background, taskbar, start menu, windows).
  - A **virtual cursor** controlled via voice commands.
  - Interactive elements (windows, buttons, text fields) respond to the virtual mouse and keyboard.

- Right **1/4 of the viewport**:  
  - **Command Reference Panel:** brief list of example commands grouped by function.
  - **Transcript Area:** scrollable log of:
    - Time
    - Raw recognized speech
    - Parsed command
    - Result / error

---

## 2. Scope, Assumptions, and Non-Goals

2.1 **In Scope (v0 / v1)**

- A **single-page web app** (`index.html`) emulating a simplified Win95-style UI.
- A **virtual mouse**:
  - Tracks position in app coordinates.
  - Moves in response to voice commands (relative or absolute).
  - Can trigger click events on UI elements.
- A **virtual keyboard**:
  - Can send keystrokes to focused elements (e.g., typing into a Win95-like text box).
- **Voice activation and control**:
  - Wake phrase: **“Hey Go”**.
  - After wake phrase, a **single command** is captured and executed.
- **Command grammar (initial set)**:
  - Mouse movement: “mouse left/right/up/down N pixels”
  - Mouse absolute: “mouse to x N y M”
  - Simple clicks: “click”, “double click”, “right click”
  - Simple typing: “type \<text\>”
- **Transcript logging** in the right panel.

2.2 **Assumptions**

- Tech stack: **Vanilla TypeScript/JavaScript** + standard Web APIs. Minimal dependencies.
- Speech recognition: Use browser speech APIs where available (e.g., Web Speech API) or an abstracted interface so backing implementation can change.
- Target environments: modern desktop browsers (Chrome/Edge-based) with microphone access.
- CSS can use any approach, but class naming should be consistent and semantic.

2.3 **Non-Goals (for now)**

- Controlling the **real OS mouse or keyboard** outside the browser.
- Full fidelity Windows 95 emulation (no need for complete file system, real programs, etc.).
- Cross-tab or multi-window coordination.
- Mobile optimization (nice to have, not required for v1).
- Accessibility beyond basic ARIA / semantic HTML in v1 (can be extended later).

---

## 3. System Architecture

3.1 **Top-Level Modules**

- **UI Layer**
  - `Win95Shell`: desktop, taskbar, windows, controls.
  - `VirtualCursor`: rendered cursor and hit-testing against UI elements.
  - `TranscriptPanel`: right-side panel with logs and command reference.
- **Voice Layer**
  - `VoiceListener`: wake phrase detection (“Hey Go”).
  - `CommandRecognizer`: captures the post-wake utterance.
- **Command Layer**
  - `CommandParser`: converts raw text into structured commands.
  - `CommandExecutor`: applies commands to the virtual mouse/keyboard and UI.
- **Core / Shared**
  - `State`: global app state (cursor position, focus, active window, mode).
  - `Events`: a simple pub/sub or event bus for communication.
  - `Config`: command grammar, thresholds, UI constants.

3.2 **Data Flow (Happy Path)**

1. User says **“Hey Go …”** followed by a command.  
2. `VoiceListener` detects wake phrase and signals `CommandRecognizer`.  
3. `CommandRecognizer` captures the next utterance and yields **raw text**.  
4. `CommandParser` transforms raw text → `Command` object, e.g.:

   ```ts
   {
     type: "MOUSE_MOVE_RELATIVE",
     direction: "LEFT",
     distance: 230
   }
````

5. `CommandExecutor` validates the command and applies it:

   * Updates `State.cursor` or sends keystrokes via virtual keyboard utilities.
   * Triggers any relevant UI events.
6. `TranscriptPanel` logs:

   * `[12:34:56] Raw: "mouse left 230 pixels" → Parsed: MOUSE_MOVE_RELATIVE(LEFT, 230) → OK`.

3.3 **Command Object Interface (v1)**

```ts
type CommandType =
  | "MOUSE_MOVE_RELATIVE"
  | "MOUSE_MOVE_ABSOLUTE"
  | "MOUSE_CLICK"
  | "MOUSE_DBLCLICK"
  | "MOUSE_RIGHT_CLICK"
  | "KEY_TYPE"
  | "KEY_PRESS";

interface BaseCommand {
  type: CommandType;
  rawText: string;
}

interface MouseMoveRelativeCommand extends BaseCommand {
  type: "MOUSE_MOVE_RELATIVE";
  direction: "LEFT" | "RIGHT" | "UP" | "DOWN";
  distancePx: number;
}

interface MouseMoveAbsoluteCommand extends BaseCommand {
  type: "MOUSE_MOVE_ABSOLUTE";
  x: number;
  y: number;
}

// etc. for click, key type, key press
```

All modules that execute commands **must** use this structured interface, not raw strings.

---

## 4. UI Specification

4.1 **Layout**

* Use a 2-column CSS layout:

  * **Left column:** 75% width, `min-width` sufficient for desktop.
  * **Right column:** 25% width, fixed or responsive.

4.2 **Left 3/4: Win95 Shell**

Minimum required elements:

* Desktop background (solid color or tiled pattern).
* Taskbar with:

  * Start button.
  * Clock placeholder.
* At least one “window”:

  * Title bar (with close/minimize buttons visually; behavior can be minimal).
  * Content area (e.g., a **Notepad-like window** where typed text appears).
* The **virtual cursor**:

  * A visible pointer icon (e.g., simple triangle or crosshair).
  * Always rendered above other content.
  * Position tracked in pixels relative to the left 3/4 area.

4.3 **Right 1/4: Control & Transcript Panel**

Sections:

1. **Status Header**

   * Shows whether the system is listening:

     * `Status: Idle`
     * `Status: Listening (Hey Go detected)`
   * Optional visual indicator (e.g., colored dot).

2. **Command Reference**

   * Group simple examples:

     * Activation:

       * “Hey Go”
     * Mouse:

       * “Hey Go, mouse left 200 pixels”
       * “Hey Go, mouse to x 400 y 300”
       * “Hey Go, click”
     * Keyboard:

       * “Hey Go, type hello world”
       * “Hey Go, press enter”

3. **Transcript Log**

   * Append-only, scrollable (`overflow-y: auto`).
   * Each entry format:

     * Timestamp
     * Raw recognized text
     * Parsed command summary
     * Result (success / error message)

Example:

```text
[12:34:56] Raw: "mouse left 230 pixels"
           Parsed: MOUSE_MOVE_RELATIVE(LEFT, 230)
           Result: OK
```

---

## 5. Voice & Command Design

5.1 **Wake Phrase Behavior (v1)**

* Wake phrase: **“Hey Go”** (case-insensitive).
* Modes:

  * **Idle:** system waits for wake phrase.
  * **Listening:** once “Hey Go” is recognized, the next utterance is treated as a command.
* Simpler v1 approach:

  * Require user to say **“Hey Go, <command>”** in a single phrase.
  * Parser splits on “hey go” to extract the command segment.

5.2 **Initial Command Grammar**

Implement at least these patterns:

* **Mouse relative:**

  * Pattern: `mouse (left|right|up|down) N (pixel|pixels)`
  * Example: “mouse left 230 pixels”

* **Mouse absolute:**

  * Pattern: `mouse to x N y M`
  * Example: “mouse to x 400 y 300”

* **Clicks:**

  * `click` → left click
  * `double click` → double left click
  * `right click` → context click

* **Typing (simple):**

  * Pattern: `type <text>`
  * Example: “type hello world” → types `hello world` into the currently focused control.

5.3 **Error Handling**

* If the command cannot be parsed:

  * Log in transcript as `Result: ERROR (Unrecognized command)` + raw text.
  * Virtual mouse/keyboard state remains unchanged.

* If parsed but invalid (e.g., coordinates out of bounds):

  * Clamp coordinates within safe range when possible.
  * Otherwise log `Result: ERROR (Out of bounds)`.

---

## 6. Folder Structure & Files

Target minimal structure (can be extended, but top level names should remain):

```text
/
├─ index.html
├─ /assets
│  ├─ icons/        # cursor, win95-style icons
│  └─ css/          # fonts, images if needed
├─ /src
│  ├─ main.ts       # app entry point, bootstraps everything
│  ├─ ui
│  │  ├─ win95Shell.ts
│  │  ├─ virtualCursor.ts
│  │  └─ transcriptPanel.ts
│  ├─ voice
│  │  ├─ voiceListener.ts
│  │  └─ commandRecognizer.ts
│  ├─ commands
│  │  ├─ commandTypes.ts
│  │  ├─ commandParser.ts
│  │  └─ commandExecutor.ts
│  ├─ core
│  │  ├─ state.ts
│  │  ├─ events.ts
│  │  └─ config.ts
│  └─ utils
│     └─ math.ts    # clamping, coordinate helpers, etc.
├─ /dist            # build output (if using a bundler)
└─ MASTERPLAN.md
```

All agents must **respect these top-level directories and filenames** unless a later version of this document explicitly updates them.

---

## 7. Workstreams (for Parallel Development)

The intention is that different agents/people can work independently as long as they respect the interfaces defined here.

7.1 **WS1 — Win95 UI Shell**

* Implement:

  * Desktop, taskbar, one or two demo windows.
  * Basic window dragging and z-order if possible.
* Provide:

  * Methods to register UI components that can receive mouse/keyboard actions.
* Collaborates with:

  * `VirtualCursor` and `CommandExecutor`.

7.2 **WS2 — Virtual Cursor & Hit-Testing**

* Implement:

  * Cursor rendering and movement.
  * Hit-testing utilities for clicks:

    * Map cursor position → UI element.
* Provide:

  * `moveCursorRelative(dx, dy)`
  * `moveCursorTo(x, y)`
  * `click(type)` functions.

7.3 **WS3 — Voice Pipeline**

* Implement:

  * `VoiceListener` using browser APIs or stub.
  * `CommandRecognizer` that yields a raw command string.
* Expose:

  * Event or callback: `onCommandText(rawText: string)`.

7.4 **WS4 — Command Parser & Executor**

* Implement:

  * Grammar for commands listed in 5.2.
  * Parsing with robust error handling.
  * Execution that calls:

    * `virtualCursor` functions.
    * Keyboard utilities.
* Ensure:

  * All commands conform to `Command` interfaces in 3.3.

7.5 **WS5 — Transcript & UX**

* Implement:

  * Transcript UI.
  * Logging API that other modules can call, e.g.:

    ```ts
    logEvent({
      timestamp,
      rawText,
      parsedCommandSummary,
      result
    });
    ```

* Ensure:

  * Clear visual feedback for users about what the system heard and did.

---

## 8. Milestones

8.1 **Milestone 0: Skeleton**

* Basic folder structure in place.
* `index.html` with split layout (3/4 + 1/4).
* No real speech or mouse control yet; just placeholder.

8.2 **Milestone 1: Virtual Mouse Demo**

* Cursor visible and movable via keyboard keys (`WASD` or arrow keys) for internal testing.
* Hit-testing for simple buttons/windows.
* Transcript panel logging manual test events.

8.3 **Milestone 2: Voice Input Integration**

* Wake phrase + single-command recognition working in at least one modern browser.
* Raw text logged correctly.
* Dummy parser that accepts a small subset (e.g., “mouse left 100 pixels”).

8.4 **Milestone 3: Full v1 Grammar + Execution**

* All commands in section 5.2 implemented and tested.
* Command errors handled gracefully.
* Transcript comprehensively logs each interaction.

8.5 **Milestone 4: Polish**

* Win95-style visuals improved (colors, fonts, window chrome).
* Basic documentation updated (`README.md`).
* Bug fixes and edge case handling (e.g., boundaries, muted mic).

---

## 9. Coding & Documentation Conventions

9.1 **General**

* Use **TypeScript where feasible**; otherwise, document all types in comments.
* Prefer small, composable functions over large ones.

9.2 **Naming**

* Modules: `camelCase` or `PascalCase` per language norms.
* Command types: `UPPER_SNAKE_CASE` strings.
* No abbreviations that are not obvious (`dx`, `dy` are fine, `mv` is not).

9.3 **Comments**

* Each public function must have:

  * A brief description.
  * Input description.
  * Expected side effects.

9.4 **Docs**

* Keep this `MASTERPLAN.md` as the **single source of truth** for high-level design.
* A shorter `README.md` may summarize for quick onboarding.

---

## 10. Future Extensions (Optional)

The following are **explicitly optional** and should not block v1:

* Continuous conversation mode (multiple commands per wake phrase).
* User-customizable commands and macros.
* More complex Win95 apps (e.g., calculator, file explorer).
* Accessibility improvements (keyboard alternatives, ARIA, captions).

---

## 11. Compliance

* Any AI agent or developer working on SoundGO **must**:

  * Read and follow this `MASTERPLAN.md`.
  * Preserve public interfaces unless there is an explicit, documented change.
  * Document any deviations or updates in a new section at the bottom of this file (`Changelog`).

Additions or changes must be appended under:

```markdown
## 12. Changelog

- v1.0 — Initial masterplan.
```

---

```

4. **Verification**

4.1 The plan defines: scope, constraints, layout, architecture, command grammar, folder structure, and workstreams.  
4.2 It is written as a single markdown file that can be dropped into the repo as `MASTERPLAN.md`.  
4.3 No external sources.
```
