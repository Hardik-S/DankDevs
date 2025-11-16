# AGENTS — SoundGO Root Instructions

These rules apply to the entire repository. Read them **and** `MASTERPLAN.md` before editing anything.

## 1. Concurrency & Workstream Guardrails
- **Do not touch files that sit outside your assigned workstream.** Each folder maps to a workstream from the masterplan:
  - `public/` & `src/ui/` → **WS5 (Transcript & UX)** and **WS1 (Shell Skeleton)**.
  - `src/voice/` → **WS2 (Voice Input)**.
  - `src/command/` → **WS3 (Command Grammar & Execution)**.
  - `src/core/` & `src/types/` → **WS4 (Shared State & Events)**.
- If a request requires cross-workstream edits, stop and document the dependency in your response instead of editing unassigned files.
- Never delete or rewrite another workstream’s files. Add new modules alongside them and leave TODO comments for the owning stream if coordination is required.

## 2. File Placement Rules
- UI assets (HTML, CSS, imagery) live under `public/`.
- TypeScript source code lives under `src/` following the module folders above.
- New shared types belong in `src/types/`.
- Keep generated JavaScript confined to `public/scripts/` by running `npm run build`.

## 3. Build & Tooling
- Use `npm run build` (TypeScript → `public/scripts`). Never hand-edit the compiled JS; edit the `.ts` source only.
- Keep `MASTERPLAN.md` as the source of truth. Update its changelog before modifying architecture-level plans.

## 4. Collaboration Etiquette
- Before starting, state explicitly in your response which workstream folders you will touch. If a teammate is already working there, defer.
- When you create new files, mention the responsible workstream in a leading comment.
- Leave `TODO(owner/workstream)` comments where follow-up work is required.
