# SoundGO

SoundGO is a browser-based Windows 95–style playground controlled by voice. The app runs entirely on GitHub Pages using Vite + TypeScript and is built according to the architecture defined in `MASTERPLAN.md`.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm 9+

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
The static assets are emitted to `dist/` for GitHub Pages.

### Preview the Production Build
```bash
npm run preview
```

## Project Structure
```
├── index.html
├── assets/
│   ├── css/
│   └── icons/
├── src/
│   ├── commands/
│   │   ├── commandExecutor.ts
│   │   ├── commandParser.ts
│   │   └── commandTypes.ts
│   ├── core/
│   │   ├── config.ts
│   │   ├── events.ts
│   │   └── state.ts
│   ├── ui/
│   │   ├── transcriptPanel.ts
│   │   ├── virtualCursor.ts
│   │   └── win95Shell.ts
│   ├── utils/
│   │   └── math.ts
│   ├── voice/
│   │   ├── commandRecognizer.ts
│   │   └── voiceListener.ts
│   ├── styles/
│   │   └── base.css
│   └── main.ts
├── MASTERPLAN.md
├── AGENTS.md
└── WORKSTREAM_RESERVATIONS.md
```

## Development Notes
- Always read `MASTERPLAN.md` before contributing; it defines the scope, layout, and command grammar.
- `AGENTS.md` explains how to reserve a workstream so teammates do not overwrite each other.
- Voice capture is currently simulated through the manual command form in the transcript panel, which feeds the parser/executor pipeline. Real speech input can be added inside `src/voice/` without touching other workstreams.
