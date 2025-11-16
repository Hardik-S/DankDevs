# Today in History

A lightweight React single-page app (built with Vite) that highlights the current day and pulls a fun historical fact that occurred on this date. It is designed to be deployed to GitHub Pages and works great as a simple "today I learned" landing page.

## Getting started

```bash
cd today-in-history
npm install
```

### Run the dev server

```bash
npm run dev
```

The site will be available at the address printed in the terminal (typically `http://localhost:5173`).

### Build for production / GitHub Pages

```bash
# The environment variable toggles the correct base path for GitHub Pages
GITHUB_PAGES=1 npm run build
```

The static files will be generated inside `today-in-history/dist`. Commit the contents of that folder to the `gh-pages` branch (or let GitHub Actions deploy it) and enable Pages for the repository.

## How it works

- The current date is formatted with `Intl.DateTimeFormat` to keep things locale-friendly.
- Historical events are fetched from [history.muffinlabs.com](https://history.muffinlabs.com/) based on the current month/day.
- A random event is displayed along with the year and a "learn more" link when available.
- Users can click **"Show me another fact"** to cycle through additional events.

Feel free to customize the styling, copy, or API source to make the page your own.
