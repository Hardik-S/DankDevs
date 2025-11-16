# Today in History

A small React app that displays today's date along with a randomly selected historical event pulled from the public API at [history.muffinlabs.com](https://history.muffinlabs.com/).

With the source now living in the repository root, GitHub Pages can build the production site directly from `npm run build` without any extra configuration.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
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
The compiled site is emitted to the `dist/` folder, which is what GitHub Pages should publish.

### Preview the Production Build
```bash
npm run preview
```

## Project Structure
```
├── index.html          # Vite entry point
├── package.json        # Scripts and dependencies
├── src/
│   ├── App.jsx         # Main UI
│   ├── App.css         # Component styles
│   ├── index.css       # Global styles
│   └── main.jsx        # React/Vite bootstrap
└── vite.config.js      # Vite configuration (base path `/` for Pages)
```

## Deployment Notes
- The project is configured with `base: '/'` so GitHub Pages can serve it from the root of the repository.
- Make sure the Pages workflow runs `npm ci && npm run build` and publishes the `dist/` directory.
