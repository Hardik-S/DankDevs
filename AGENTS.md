# AGENTS — SoundGO Collaboration Contract

## Scope
This file applies to the entire `DankDevs` repository. There are currently no nested `AGENTS.md` overrides.

## Required Reading
1. `MASTERPLAN.md`
2. `WORKSTREAM_RESERVATIONS.md`

Do not accept or implement any request until both have been reviewed for the latest direction and reservations.

## Workstream Guardrails
To keep teammates from stepping on each other:

1. **Claim your area first.** Before editing, add an entry under the appropriate workstream in `WORKSTREAM_RESERVATIONS.md`. If the slot is occupied, the change must wait or be coordinated with that owner.
2. **Stay in your lane.** Only modify files that belong to the workstream you claimed:
   - WS1 — `src/ui/win95Shell.ts`, desktop styling, and anything under `assets/`.
   - WS2 — `src/ui/virtualCursor.ts` plus any cursor-specific helpers.
   - WS3 — Everything inside `src/voice/`.
   - WS4 — `src/commands/*` and `src/core/*`.
   - WS5 — `src/ui/transcriptPanel.ts`, panel layout, and command reference copy.
   - Shared docs (`MASTERPLAN.md`, `README.md`, `AGENTS.md`, `WORKSTREAM_RESERVATIONS.md`) require explicit mention in the user request.
3. **No drive-by edits.** If a task requires touching another workstream, split the work into separate requests so another agent can take the other part.
4. **Document interface changes.** Any change to exported functions or types must be noted at the bottom of `MASTERPLAN.md` in the changelog before merging.

## Code Conventions
- Follow the folder structure defined in `MASTERPLAN.md`.
- Keep TypeScript types strict; no `any` without justification in a comment.
- UI work must keep the Win95 aesthetic described in the plan.

## Review Checklist for Agents
Before completing a task, confirm:
1. Your reservation is recorded and still valid.
2. No files outside your claimed workstream were changed.
3. Tests/linters relevant to your area have run (e.g., `npm run build`).
4. The final summary references the workstream so reviewers know which surface was touched.
