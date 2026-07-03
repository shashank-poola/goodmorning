# Good Morning — Personal Morning Command Center

A single-page, dark, minimal dashboard that replaces checking 20 apps every
morning: calendar, email, news, GitHub trending, tweets, LinkedIn, to-dos,
yesterday's recap, Claude Code usage, reminders, stocks, and a
compose-once/post-everywhere bar.

**Status:** Frontend v1 — realistic placeholder data behind a swappable
`DataProvider`. See `docs/INTEGRATION.md` for the backend plan.

## Run

    npm install
    npm run dev        # http://localhost:5173

## Test & build

    npm test           # Vitest + React Testing Library
    npm run build      # typecheck (strict) + production build
    npm run preview    # serve the production build

## Docs

- `docs/DESIGN.md` — the "Polar Night Glow" visual system and rationale
- `docs/ARCHITECTURE.md` — code structure, data layer, how to add a widget
- `docs/INTEGRATION.md` — per-widget backend integration guide
- `docs/superpowers/specs/` — the approved design spec
