# Backend Integration Guide

The goal of Phase 2/3: replace `MockDataProvider` with an
`ApiDataProvider` that aggregates real sources. The UI is already built
against the `DataProvider` interface (`src/data/DataProvider.ts`) — no
frontend changes are needed beyond the swap in `providerFactory.ts`.

## Recommended shape

A small backend service (or serverless functions) exposing one endpoint
per provider method, each returning JSON matching `src/data/types.ts`
exactly. `ApiDataProvider` is then a thin `fetch` wrapper. Keep secrets
server-side; the browser talks only to your backend.

## Per-widget integration table

| Provider method | Widget | Real source(s) | Auth | Notes |
|---|---|---|---|---|
| `getQuote()` | TopBar quote | ZenQuotes / quotable.io, or a curated file | none | Cache daily |
| `getCalendar()` | Calendar | Google Calendar API (multiple calendars) | OAuth2 | Map each calendar → `CalendarSource`; keep hue assignment stable |
| `getEmails()` | Important Emails | Gmail API (multiple accounts), importance filter | OAuth2 | "Important" = Gmail importance markers or your own rules; map account → `Mailbox` |
| `getNews()` | News tabs | NewsAPI / RSS (Verge, Reuters, BBC…) | API key | Tag items `tech`/`world` server-side |
| `getRepoTrends()` | GitHub tab | GitHub trending (scrape or ossinsight.io API) | none/PAT | `starsToday` = star delta |
| `getTweets()` | Tweets | X API v2 home timeline or list timeline | OAuth2 (paid tier) | Fallback: curated list via Nitter-style RSS |
| `getLinkedIn()` | LinkedIn | LinkedIn API (limited) or manual export | OAuth2 | Official API is restrictive; consider a daily scraper or manual CSV. Suggested replies: generate with Claude API from message text |
| `getTodos()` | To-Do | Your task app (Todoist/Things/Notion) | API key | v1 toggles are local; Phase 3 adds a `setTodoDone` mutation to the interface |
| `getYesterdayRecap()` | Recap | Composed server-side from calendar+email+git+socials | — | Great Claude API summarization job |
| `getUsageStats()` | Claude usage | Anthropic Console usage export / Admin API | API key | Tokens, sessions, cost per day |
| `getReminders()` | Reminders | Google Contacts birthdays + your own list | OAuth2 | Compute nothing server-side; UI derives days-until |
| `getStocks()` | Ticker | Finnhub / Alpha Vantage / Yahoo Finance | API key | `changePct` vs previous close; refresh every few minutes |
| — (ComposeBar) | Compose bar | LinkedIn share API, X post API, Substack email, newsletter tool | OAuth2/keys | Phase 3: add `postEverywhere(text, platforms)` to the interface and enable the Post button |

## Refresh strategy (Phase 3)

Add per-method polling in `ApiDataProvider` or a `refreshIntervalMs` map;
`useWidgetData` can accept an optional interval parameter then. Morning
usage pattern means most data only needs one fetch + stocks/news on a
short interval.

## Error contract

Any provider method may reject; the UI already shows a per-widget error
state with Retry. Return real HTTP errors — do not fake empty data on
failure.
