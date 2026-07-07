# Consolidated Calendar — Subsystem Spec

Date: 2026-07-07  
Parent: [Platform Vision & Roadmap](./2026-07-07-platform-vision-and-roadmap.md)  
Status: Approved for build  
Scope: First real-data subsystem — backend skeleton + Google Calendar

---

## 1. Goal

Show **today's merged calendar** in the existing Calendar widget (`src/widgets/Calendar/`), sourced from **one or more Google accounts** connected via **read-only OAuth**. Each account appears as a color-coded `CalendarSource`; events are sorted by start time.

**Non-goals for this pass:**
- Private/client calendar OCR via Slack/WhatsApp (backlog §4.1)
- Creating or editing events
- UI redesign of the Calendar widget
- Email, News, or other subsystems

---

## 2. User story

> As Prashant, I open Good Morning and immediately see today's meetings from all my Google calendars — color-coded by account — without opening three separate calendar apps.

---

## 3. Auth & privacy

- **Scope:** `calendar.readonly` + `userinfo.email` (identify account, no write access).
- **Flow:** Standard Google OAuth 2.0 authorization code; refresh tokens stored **server-side only** in `server/.data/` (gitignored).
- **Constraint (parent doc §3):** Tokens never leave our backend; no third-party automation service receives credentials.
- **Multi-account:** Each successful OAuth callback **adds** an account (does not replace). A `/auth/google` link can be visited again to connect another Gmail.

---

## 4. API contract

All responses match `src/data/types.ts`.

### `GET /api/health`

```json
{ "ok": true, "service": "goodmorning-server" }
```

### `GET /api/auth/status`

```json
{
  "connected": true,
  "accounts": [{ "id": "google-abc", "email": "work@gmail.com", "name": "work@gmail.com", "color": "gold" }]
}
```

### `GET /api/calendar`

Returns today's events across all connected accounts.

```json
{
  "sources": [
    { "id": "google-abc", "name": "work@gmail.com", "color": "gold" }
  ],
  "events": [
    {
      "id": "google-abc:evt123",
      "sourceId": "google-abc",
      "title": "Standup",
      "start": "2026-07-07T09:30:00+01:00",
      "end": "2026-07-07T09:45:00+01:00",
      "meetLink": "https://meet.google.com/..."
    }
  ]
}
```

**Errors:**
- `401` — no accounts connected; body includes `authUrl: "/auth/google"`.
- `502` — Google API failure after retries.

### `GET /auth/google`

Redirects to Google consent screen.

### `GET /auth/google/callback`

Exchanges code, persists tokens, redirects to frontend (`FRONTEND_URL`).

---

## 5. Data mapping (Google → dashboard)

| Google field | Dashboard field |
|---|---|
| Account email | `CalendarSource.name` |
| Stable account id (`google-{sub}`) | `CalendarSource.id` |
| Hash of email → palette | `CalendarSource.color` (`gold` \| `sage` \| `blue` \| `clay`) |
| `event.id` | `CalendarEvent.id` (prefixed with source id) |
| `summary` | `CalendarEvent.title` |
| `start.dateTime` / `start.date` | `CalendarEvent.start` (ISO) |
| `end.dateTime` / `end.date` | `CalendarEvent.end` (ISO) |
| `location` | `CalendarEvent.location` |
| `hangoutLink` or `conferenceData` | `CalendarEvent.meetLink` |

**Time window:** Start of today → end of today in `CALENDAR_TIMEZONE` (default `Europe/London`).

**Sort:** Events ascending by `start`.

---

## 6. Frontend integration

- New `ApiDataProvider` (`src/data/ApiDataProvider.ts`): `getCalendar()` fetches `/api/calendar`; all other methods delegate to `MockDataProvider` until their subsystems ship.
- `providerFactory.ts`: when `VITE_USE_API=true`, use `ApiDataProvider`; tests always use mock (zero latency).
- Vite dev proxy: `/api` and `/auth` → `http://localhost:3001`.

---

## 7. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `GOOGLE_CLIENT_ID` | server | OAuth client |
| `GOOGLE_CLIENT_SECRET` | server | OAuth client |
| `GOOGLE_REDIRECT_URI` | server | e.g. `http://localhost:3001/auth/google/callback` |
| `FRONTEND_URL` | server | Post-auth redirect, e.g. `http://localhost:5173` |
| `CALENDAR_TIMEZONE` | server | IANA timezone for "today" window |
| `PORT` | server | Default `3001` |
| `VITE_USE_API` | frontend | `true` to enable real calendar |
| `VITE_API_BASE_URL` | frontend | Optional; empty = same-origin (proxy) |

---

## 8. Acceptance criteria

- [ ] `server/` runs independently (`npm run dev` in `server/`)
- [ ] Health endpoint responds
- [ ] Google OAuth connects at least one account
- [ ] `GET /api/calendar` returns real events matching `types.ts`
- [ ] Dashboard Calendar widget shows real events when `VITE_USE_API=true`
- [ ] Widget error + Retry still works on API failure
- [ ] All existing frontend tests pass (mock path unchanged)
- [ ] Server unit tests for token store and calendar mapping

---

## 9. Future (out of scope)

- Free-time gaps rendered in the widget
- Per-calendar toggles (not just per-account)
- Token encryption at rest
- Postgres/Redis token store for production
- Calendar photo OCR via messaging bot
