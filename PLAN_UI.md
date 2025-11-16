1. **Task & success criteria**

1) Design a **UI implementation plan** for a web-based Windows 95 emulator that is **controlled only via voice commands**.
2) The **UI plan itself** must be expressed as a **7×3 checklist table**.
3) The plan must fully encode: 80/20 layout, Win95 shell details, custom SVG cursor, and right-side control/transcript panel specs.

---

2. **Minimal plan**

1) Define root layout (80% Win95 viewport, 20% control panel).
2) Specify Win95 desktop visuals (background, logo, taskbar).
3) Specify a single open application window (e.g., Notepad / meme file).
4) Define custom cursor layer and coordinate system (relative to left 80%).
5) Specify control panel layout (status indicator + command list).
6) Specify transcript log behavior and structure.
7) Specify wiring between voice events and UI state (status, commands, log, cursor).

---

3. **Execution – 7×3 UI checklist**

| # | UI Area / Layer                              | Checklist (implement and tick off)                                                                                                                                                                                                                                                                                                                                                                                                                     |
| - | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | **Root layout (80/20 split)**                | [ ] Create top-level container that fills viewport (100vw × 100vh).<br>[ ] Implement two child panels: `.desktop-pane` (left) and `.control-pane` (right).<br>[ ] Set `.desktop-pane` width to 80% and `.control-pane` to 20% using flex or CSS grid; ensure responsive behavior but fixed ratio.                                                                                                                                                      |
| 2 | **Win95 desktop shell (left 80%)**           | [ ] Set `.desktop-pane` background to solid teal matching classic Win95 (e.g., `#008080`).<br>[ ] Center a Win95 logo image or SVG in the middle of `.desktop-pane` (absolute or flex-centered).<br>[ ] Reserve space at bottom for a taskbar strip spanning full width of the left 80% panel.                                                                                                                                                         |
| 3 | **Taskbar, Start button, clock**             | [ ] Add a `.taskbar` div at bottom of `.desktop-pane` (fixed height, e.g., 40px) with Win95-style grey background and 3D borders.<br>[ ] Place a `Start` button in bottom-left of taskbar with Win95 styling and label “Start”.<br>[ ] Place a digital clock in bottom-right of taskbar that displays current time and auto-updates (JS interval).                                                                                                     |
| 4 | **Open window + applications**               | [ ] Create a single window component (e.g., `.win95-window`) positioned above desktop, with title bar and classic Win95 borders.<br>[ ] Inside the window, support at least a simple Notepad-like text area and a “meme file” placeholder (icon, filename, or preview).<br>[ ] Ensure window supports z-index above desktop and below cursor, and is sized/positioned to look like an active app.                                                      |
| 5 | **Custom cursor layer (SVG middle finger)**  | [ ] Import or embed an SVG for the cursor graphic (middle finger) and render it as an absolutely positioned element inside `.desktop-pane` only.<br>[ ] Ensure cursor has a **dedicated overlay layer** (`pointer-events: none; z-index` higher than windows and taskbar) so it always appears on top.<br>[ ] Track and update cursor position in **pixel coordinates relative to the left 80% panel’s origin** (top-left of `.desktop-pane` = (0,0)). |
| 6 | **Control / transcript panel (right 20%)**   | [ ] Build `.control-pane` with vertical layout: **status indicator** at top, **command list** under it, **transcript log** filling the remaining space.<br>[ ] Implement status indicator component that can display at least two states: “Idle” and “Listening” (with distinct colors/labels).<br>[ ] Under status, render the **current/last few commands** as a simple list (e.g., each as a one-line summary of the parsed voice command).         |
| 7 | **Transcript log (append-only + structure)** | [ ] Implement a scrollable transcript area (`overflow-y: auto`) that is append-only from app logic (no manual editing).<br>[ ] Define a transcript entry schema with fields: timestamp, raw recognized text, parsed command summary, result (ok / error message).<br>[ ] Render each entry as a compact block showing all four fields, newest at bottom; auto-scroll to bottom on new entry unless the user has manually scrolled up.                  |

---

4. **Verification vs. success criteria**

1) **80/20 layout present?** Yes: rows 1, 2, and 6 specify it.
2) **Win95 look & shell?** Yes: rows 2–4 cover background, logo, taskbar, Start, clock, window.
3) **Cursor spec?** Yes: row 5 defines SVG cursor, z-index, pixel-relative coordinates to left 80%.
4) **Control/transcript panel?** Yes: rows 6–7 define status indicator, command list, transcript log structure and behavior.

No external sources.
