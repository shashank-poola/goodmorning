# Consolidated Calendar — Implementation Plan

Date: 2026-07-07  
Spec: [2026-07-07-consolidated-calendar.md](../specs/2026-07-07-consolidated-calendar.md)

---

## Architecture (Option A)

```
goodmorning/
  src/                          ← React frontend (unchanged widgets)
    data/
      ApiDataProvider.ts        ← NEW: real calendar + mock fallback
      providerFactory.ts        ← swap point
  server/                       ← NEW: thin API service
    src/
      index.ts                  ← entry
      app.ts                    ← Hono routes
      config.ts                 ← env validation
      routes/                   ← health, auth, calendar
      services/                 ← Google OAuth, calendar fetch, token store
      lib/                      ← colors, dates, errors
```

---

## Tonight's checklist

### Docs
- [x] Subsystem spec written
- [x] Implementation plan + checklist written

### Backend skeleton
- [x] `server/package.json` + TypeScript config
- [x] Hono app with CORS + `/api/health`
- [x] Config from env with validation
- [x] `.env.example` for server

### Google OAuth
- [x] `GET /auth/google` → consent redirect
- [x] `GET /auth/google/callback` → store tokens, redirect to frontend
- [x] `GET /api/auth/status` → list connected accounts
- [x] File-based token store (`server/.data/tokens.json`, gitignored)

### Calendar API
- [x] `GET /api/calendar` → merged today events from all accounts
- [x] Map Google events → `CalendarSource` + `CalendarEvent`
- [x] Stable color per account email
- [x] 401 when no accounts connected (with `authUrl`)

### Frontend wiring
- [x] `ApiDataProvider` — `getCalendar` from API, rest from mock
- [x] `providerFactory` — `VITE_USE_API` toggle; tests stay on mock
- [x] Vite proxy `/api` + `/auth` → port 3001
- [x] `.env.example` for frontend

### Quality
- [x] Server unit tests (token store, color mapping, date window, routes)
- [x] `ApiDataProvider` unit test
- [x] `npm test` (frontend) passes
- [x] `npm run build` (frontend) passes
- [x] `npm test` (server) passes

### Manual verification (needs Prashant's Google Cloud project)
- [ ] Create OAuth client in Google Cloud Console
- [ ] Copy credentials to `server/.env`
- [ ] Visit `/auth/google`, connect account
- [ ] Calendar widget shows real events with `VITE_USE_API=true`

---

## Run locally

```bash
# Terminal 1 — API
cd server
cp .env.example .env   # fill in Google credentials
npm install
npm run dev            # http://localhost:3001

# Terminal 2 — Frontend
cp .env.example .env     # VITE_USE_API=true
npm install
npm run dev            # http://localhost:5173
```

First-time auth: open http://localhost:3001/auth/google (or http://localhost:5173/auth/google via proxy).

---

## Google Cloud setup (one-time)

1. Create project at https://console.cloud.google.com
2. Enable **Google Calendar API**
3. OAuth consent screen → External → add test user (Prashant's email)
4. Credentials → OAuth 2.0 Client ID → Web application
5. Authorized redirect URI: `http://localhost:3001/auth/google/callback`
6. Copy Client ID + Secret into `server/.env`

---

## Milestones after tonight

| Milestone | What |
|---|---|
| M2 | Consolidated Email (same OAuth infra) |
| M3 | News + Tweets RSS engine |
| M4 | Slack/WhatsApp todo bot |
| M5 | Production deploy (Railway/Fly) + encrypted token store |
