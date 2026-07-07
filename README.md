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

### With real Google Calendar (Option A backend)

    # Terminal 1 — API
    cd server
    cp .env.example .env    # add Google OAuth credentials
    npm install
    npm run dev             # http://localhost:3001

    # Terminal 2 — Frontend
    cp .env.example .env
    # set VITE_USE_API=true
    npm run dev             # http://localhost:5173

First-time: open http://localhost:5173/auth/google to connect a Google account.
See `docs/superpowers/plans/2026-07-07-consolidated-calendar.md` for the full checklist.

## Test & build

    npm test           # Vitest + React Testing Library
    npm run build      # typecheck (strict) + production build
    npm run preview    # serve the production build

## Docs

- `docs/DESIGN.md` — the "Polar Night Glow" visual system and rationale
- `docs/ARCHITECTURE.md` — code structure, data layer, how to add a widget
- `docs/INTEGRATION.md` — per-widget backend integration guide
- `docs/superpowers/specs/` — the approved design spec
