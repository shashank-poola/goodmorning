# Good Morning — Personal Morning Command Center: Design Spec

**Date:** 2026-07-03
**Status:** Approved by user
**Scope:** Frontend v1 (placeholder data). Backend and integration are future phases; this spec documents the contracts they must satisfy.

---

## 1. Goal & Vision

One dark, classy, single-page dashboard the user opens every morning to replace checking ~20 apps. At a glance it shows: consolidated calendar, important emails, tech/world news, trending GitHub repos, tweets, LinkedIn stats and messages, to-dos, yesterday's recap, Claude Code usage, reminders/birthdays, a scrolling stock ticker, and a compose-once/post-everywhere bar.

**V1 deliverable:** a fully built, tested frontend running on realistic placeholder data, architected so backend integration later requires implementing one interface — no widget rewrites.

**Non-goals for v1:** real API calls, authentication, data persistence beyond local component state, drag-and-drop layout customization, a public marketing site.

## 2. Visual System — "Polar Night Glow"

The aesthetic: northern lights over dark arctic ice. Deep layered blue-blacks with sparing aurora glow accents. Minimal, editorial, calm — light appears only where information is alive.

### 2.1 Palette

| Token | Hex | Role |
|---|---|---|
| `--bg-base` | `#070B12` | Page background (polar night, never pure black) |
| `--bg-panel` | `#0D1420` | Widget panel surface |
| `--bg-raised` | `#121B2B` | Hover/raised surfaces, chips |
| `--border` | `#1A2432` | 1px panel borders, dividers |
| `--text-primary` | `#E6EDF7` | Headings, primary content |
| `--text-secondary` | `#8B98AC` | Meta text, labels, timestamps |
| `--accent-cyan` | `#67E8F9` | Primary accent — live elements: clock, ticker, links, active nav |
| `--accent-green` | `#6EE7B7` | Positive — stocks up, completed todos, quote bar accent |
| `--accent-violet` | `#A78BFA` | Social/creative — tweets, LinkedIn, post automation |
| `--accent-rose` | `#FDA4AF` | Urgent/negative — stocks down, important emails |

**Color theory rationale:** an analogous cool-hue family (cyan → green → violet) on a cool dark base gives harmony; rose is the single warm complement, reserved exclusively for urgency so it always reads as "attention." Accents are used at low volume (dots, deltas, glows, 1px indicators) — surfaces stay neutral. Color always *identifies* (source, direction, urgency), never decorates.

**Color-coding systems:**
- Calendar sources: each source (e.g. Personal / Work / Side-project) gets a hue dot from the accent set.
- Mailboxes: each mailbox gets a hue dot; consistent with calendar hues where the account is the same.

### 2.2 Typography

- **UI:** Instrument Sans (fallback: system-ui grotesque). Tabular numerals (`font-variant-numeric: tabular-nums`) for clock, stocks, stats.
- **Display:** Newsreader (light weight, serif) for the daily quote only — the classy signature element.
- Scale: 12/13/14/16/20/28px steps; generous letter-spacing on small uppercase labels.

### 2.3 Glow & Motion

- Soft cyan `text-shadow` glow on the live clock and ticker symbols; barely-visible aurora gradient on panel hover. Restraint is the rule.
- Staggered fade-up of widgets on load (~600ms total).
- Live seconds tick; ticker is an infinite right-to-left CSS marquee (duplicated track technique).
- All motion gated behind `prefers-reduced-motion`.

## 3. Layout

Desktop-first CSS Grid mirroring the user's wireframe:

```
┌──────────────────────────────────────────────────────┐
│ Quote of the day (serif)          Date · Day · Clock │
├────┬───────────────┬───────────────────┬─────────────┤
│ S  │ Calendar      │ News + GitHub     │ Tweets      │
│ i  │ (color-coded) │ (tabbed, scroll)  │ (scroll)    │
│ d  ├───────────────┼───────────────────┴─────────────┤
│ e  │ Imp. Emails   │ LinkedIn: followers · post stats│
│ b  │ (by mailbox)  │ · messages w/ suggested replies │
│ a  ├──────────┬────┴─────┬────────────┬──────────────┤
│ r  │ To-Do    │Yesterday │Claude Code │ Reminders /  │
│    │ list     │Recap     │usage stats │ Birthdays    │
├────┴──────────┴──────────┴────────────┴──────────────┤
│ ◀ scrolling stock ticker (▲green ▼rose vs yesterday) │
├──────────────────────────────────────────────────────┤
│ Compose once → post to LinkedIn · X · Substack · NL  │
└──────────────────────────────────────────────────────┘
```

- **Sidebar:** slim icon rail (Messages, Calendar, News, To-Do, plus Overview). Clicking smooth-scrolls to and briefly highlights the matching widget. These are the hooks for future "detailed individual view" pages.
- **Responsive:** ≥1200px full grid; tablet (768–1199px) two columns, sidebar stays; mobile (<768px) single column, sidebar becomes a fixed bottom icon bar, ticker stays as marquee.
- Scrollable widget bodies scroll internally (thin styled scrollbars); the page itself never scrolls horizontally.

## 4. Architecture

### 4.1 Stack

- React 18 + Vite + TypeScript (strict).
- Styling: CSS Modules per widget + global design tokens as CSS custom properties in `src/styles/tokens.css`. No UI framework — full aesthetic control, minimal bundle.
- Testing: Vitest + React Testing Library.

### 4.2 Data layer (the backend contract)

```
src/data/
  types.ts          // all data contracts
  DataProvider.ts   // the interface
  MockDataProvider.ts
  providerFactory.ts // returns the active provider (swap point)
```

- `types.ts` defines: `Quote`, `CalendarEvent`, `CalendarSource`, `Email`, `Mailbox`, `NewsItem`, `RepoTrend`, `Tweet`, `LinkedInStats`, `LinkedInMessage`, `Todo`, `YesterdayRecap`, `UsageStats`, `Reminder`, `StockQuote`, `ComposeTarget`.
- `DataProvider` interface: one async method per widget (`getQuote()`, `getCalendar()`, `getEmails()`, `getNews()`, `getRepoTrends()`, `getTweets()`, `getLinkedIn()`, `getTodos()`, `getYesterdayRecap()`, `getUsageStats()`, `getReminders()`, `getStocks()`).
- `MockDataProvider`: realistic, hand-crafted placeholder data with simulated latency (100–400ms) so loading states are real. Dates are computed relative to "today" so the page always looks current.
- **Backend day:** implement `ApiDataProvider` satisfying the same interface; switch it in `providerFactory`. Zero widget changes.

### 4.3 Widget pattern

```
src/widgets/<WidgetName>/
  <WidgetName>.tsx
  <WidgetName>.module.css
  <WidgetName>.test.tsx
```

- Shared `useWidgetData<T>(fetcher)` hook returns `{ data, loading, error, retry }`.
- Shared `Panel` component provides the widget chrome: title, optional accent, skeleton/error/empty states.
- Shell components: `App` → `TopBar` (quote + date/clock), `Sidebar`, `DashboardGrid`, `TickerBar`, `ComposeBar`.

## 5. Widget Specifications (13)

1. **TopBar:** daily quote in serif with author (green accent underline) on the left; full date, weekday, and live clock (HH:MM:SS, tabular nums, cyan glow) on the right.
2. **Sidebar nav:** icon rail; Overview, Messages, Calendar, News, To-Do. Active-section highlight; smooth scroll on click.
3. **Consolidated Calendar:** today's events as a vertical timeline, color dot per source, time, title, location/meet link icon; "now" line indicator.
4. **Important Emails:** list grouped by mailbox hue dot; sender, subject, one-line preview, time; unread = brighter text + dot.
5. **News + GitHub:** tabbed panel ("Tech", "World", "GitHub"); scrollable list — headlines with source/time; repos with stars-today delta.
6. **Tweets:** scrollable cards — avatar placeholder, handle, text, engagement counts; violet accent.
7. **LinkedIn panel:** three columns — followers gained (with delta arrow), yesterday's post stats (impressions, reactions, comments), and scrollable messages each with a static "suggested reply" chip (tap = copies text, v1).
8. **To-Do list:** check-off-able items (local state only in v1), priority tint, completed items strike through in green.
9. **Yesterday Recap:** short bullet digest (meetings attended, emails handled, commits, posts) — placeholder narrative.
10. **Claude Code usage:** tokens/sessions/cost yesterday vs day before, tiny CSS bar chart.
11. **Reminders/Birthdays:** upcoming items with days-until countdown; today's items highlighted.
12. **Stock ticker:** infinite right-to-left marquee of ~10 holdings: symbol, price, ▲/▼ % vs yesterday (green/rose); pauses on hover.
13. **Compose bar:** textarea + platform toggle chips (LinkedIn, X, Substack, Newsletter) + "Post" button disabled with tooltip "Connects when backend lands."

## 6. States & Error Handling

Every data widget renders three non-data states via `Panel`:
- **Loading:** skeleton shimmer blocks matching the widget's shape.
- **Error:** quiet inline message + "Retry" text button (calls `retry()`); never a crash, never a blank panel.
- **Empty:** friendly line, e.g. "Nothing here — enjoy the quiet."

This guarantees graceful per-widget degradation when real APIs fail later. The page shell (grid, topbar, sidebar) is static and cannot fail.

## 7. Testing

- **Contract tests:** `MockDataProvider` returns data satisfying every type (shape + required fields), all methods resolve.
- **Widget render tests:** per widget — renders data correctly, shows skeleton while pending, shows error + retry on rejection.
- **Behavior tests:** clock ticks (fake timers), todo check toggles, tabs switch, suggested-reply copy, ticker duplicates its track.
- **Manual QA pass:** browser screenshots at desktop/tablet/mobile widths, reduced-motion check, keyboard navigation over interactive elements.

## 8. Documentation Deliverables

- `README.md` — install, run, build, test.
- `docs/DESIGN.md` — visual system, palette + color-theory rationale, typography, motion rules.
- `docs/ARCHITECTURE.md` — data contracts, provider pattern, folder layout, how to add a widget.
- `docs/INTEGRATION.md` — per-widget integration table: data needed, suggested real source (Google Calendar, Gmail, RSS/news API, GitHub trending, X API, LinkedIn API, stock API, Anthropic usage), auth notes, provider method to implement, and shape of the response. This is the "context handoff" for the future backend build.

## 9. Future Phases (recorded, not built)

- **Phase 2 — Backend:** service that aggregates the real sources and exposes endpoints matching `DataProvider` semantics.
- **Phase 3 — Integration:** `ApiDataProvider`, auth, refresh intervals per widget, suggested-reply generation (LLM), post automation (compose bar goes live), detailed individual views behind the sidebar items.
