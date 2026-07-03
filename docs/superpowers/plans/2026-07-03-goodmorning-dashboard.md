# Good Morning Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Good Morning" single-page dark dashboard frontend — 13 widgets on realistic placeholder data behind a swappable `DataProvider`, per the approved spec at `docs/superpowers/specs/2026-07-03-goodmorning-dashboard-design.md`.

**Architecture:** React 18 + Vite + TypeScript (strict). Widgets are isolated components under `src/widgets/`, each consuming data via a shared `useWidgetData` hook from a singleton `provider` (today `MockDataProvider`, later `ApiDataProvider` — swapped in one file). Styling is CSS Modules + design tokens ("Polar Night Glow") as CSS custom properties.

**Tech Stack:** React 18, Vite 5, TypeScript 5 (strict), CSS Modules, Vitest + React Testing Library.

## Global Constraints

- TypeScript `strict: true`; build must pass `tsc` with `noUnusedLocals`/`noUnusedParameters`.
- No UI framework, no CSS framework, no chart library — hand-rolled CSS only.
- All colors come from tokens in `src/styles/tokens.css` — **never hardcode hex values in widget CSS**.
- All animation gated behind `@media (prefers-reduced-motion: reduce)` (disable there).
- Every data widget must render loading (skeleton), error (+Retry), and empty states via shared components.
- Widget data access ONLY via `provider` from `src/data/providerFactory.ts` — widgets never construct providers.
- Provider methods are arrow-function class properties (stable references — safe as `useEffect` deps).
- Node ≥ 18. Tests colocated with source (`X.test.tsx` next to `X.tsx`).
- Commit after every task (messages given per task).
- Empty-state copy is exactly: `Nothing here — enjoy the quiet.`

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/test/setup.ts`, `src/styles/tokens.css`, `src/styles/global.css`

**Interfaces:**
- Produces: design tokens (CSS custom properties listed below) used by every later task; `App` component that later tasks extend.

- [ ] **Step 1: Write scaffold files**

`.gitignore`:
```
node_modules
dist
*.local
```

`package.json`:
```json
{
  "name": "goodmorning",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <title>Good Morning</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

`src/styles/tokens.css` (the Polar Night Glow system — exact values from the spec):
```css
:root {
  --bg-base: #070b12;
  --bg-panel: #0d1420;
  --bg-raised: #121b2b;
  --border: #1a2432;
  --text-primary: #e6edf7;
  --text-secondary: #8b98ac;
  --accent-cyan: #67e8f9;
  --accent-green: #6ee7b7;
  --accent-violet: #a78bfa;
  --accent-rose: #fda4af;

  --font-ui: 'Instrument Sans', system-ui, sans-serif;
  --font-display: 'Newsreader', Georgia, serif;

  --radius: 10px;
  --gap: 16px;
  --glow-cyan: 0 0 12px rgba(103, 232, 249, 0.35);
}
```

`src/styles/global.css`:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 14px;
  line-height: 1.5;
  overflow-x: hidden;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx` (minimal — extended in Task 4):
```tsx
export function App() {
  return <div>Good Morning</div>
}
```

`src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { App } from './App'

it('renders the app shell', () => {
  render(<App />)
  expect(screen.getByText(/good morning/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Install and verify test passes**

Run: `npm install && npm test`
Expected: 1 test file, 1 passed.

- [ ] **Step 3: Verify build and dev server**

Run: `npm run build`
Expected: `tsc` clean, vite build outputs `dist/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS project with Polar Night Glow tokens"
```

---

### Task 2: Data contracts, DataProvider interface, MockDataProvider

**Files:**
- Create: `src/data/types.ts`, `src/data/DataProvider.ts`, `src/data/MockDataProvider.ts`, `src/data/providerFactory.ts`
- Test: `src/data/MockDataProvider.test.ts`

**Interfaces:**
- Produces: all types below; `DataProvider` interface; singleton `provider: DataProvider` exported from `src/data/providerFactory.ts`. Every widget task consumes `provider.getX` methods exactly as named here.

- [ ] **Step 1: Write the failing contract test**

`src/data/MockDataProvider.test.ts`:
```ts
import { MockDataProvider } from './MockDataProvider'

describe('MockDataProvider contract', () => {
  const p = new MockDataProvider({ latencyMs: 0 })

  it('resolves quote with text and author', async () => {
    const q = await p.getQuote()
    expect(q.text.length).toBeGreaterThan(0)
    expect(q.author.length).toBeGreaterThan(0)
  })

  it('resolves calendar with sources and events referencing valid sources', async () => {
    const { sources, events } = await p.getCalendar()
    expect(sources.length).toBeGreaterThan(1)
    expect(events.length).toBeGreaterThan(2)
    const ids = new Set(sources.map((s) => s.id))
    for (const e of events) expect(ids.has(e.sourceId)).toBe(true)
  })

  it('resolves emails grouped into valid mailboxes', async () => {
    const { mailboxes, emails } = await p.getEmails()
    const ids = new Set(mailboxes.map((m) => m.id))
    expect(emails.length).toBeGreaterThan(2)
    for (const e of emails) expect(ids.has(e.mailboxId)).toBe(true)
  })

  it('resolves news, repos, tweets, linkedin, todos, recap, usage, reminders, stocks', async () => {
    expect((await p.getNews()).length).toBeGreaterThan(3)
    expect((await p.getRepoTrends()).length).toBeGreaterThan(2)
    expect((await p.getTweets()).length).toBeGreaterThan(2)
    const li = await p.getLinkedIn()
    expect(li.stats.followersGainedYesterday).toBeGreaterThan(0)
    expect(li.messages.length).toBeGreaterThan(1)
    expect((await p.getTodos()).length).toBeGreaterThan(2)
    expect((await p.getYesterdayRecap()).bullets.length).toBeGreaterThan(2)
    const u = await p.getUsageStats()
    expect(u.yesterday.tokens).toBeGreaterThan(0)
    expect((await p.getReminders()).length).toBeGreaterThan(1)
    expect((await p.getStocks()).length).toBeGreaterThanOrEqual(8)
  })

  it('calendar events fall on today', async () => {
    const { events } = await p.getCalendar()
    const today = new Date().toDateString()
    for (const e of events) expect(new Date(e.start).toDateString()).toBe(today)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data`
Expected: FAIL — cannot resolve `./MockDataProvider`.

- [ ] **Step 3: Write types, interface, mock provider, factory**

`src/data/types.ts`:
```ts
export type AccentColor = 'cyan' | 'green' | 'violet' | 'rose'

export interface Quote {
  text: string
  author: string
}

export interface CalendarSource {
  id: string
  name: string
  color: AccentColor
}

export interface CalendarEvent {
  id: string
  sourceId: string
  title: string
  start: string // ISO datetime
  end: string // ISO datetime
  location?: string
  meetLink?: string
}

export interface Mailbox {
  id: string
  name: string
  color: AccentColor
}

export interface Email {
  id: string
  mailboxId: string
  sender: string
  subject: string
  preview: string
  receivedAt: string // ISO datetime
  unread: boolean
}

export interface NewsItem {
  id: string
  category: 'tech' | 'world'
  headline: string
  source: string
  publishedAt: string // ISO datetime
  url: string
}

export interface RepoTrend {
  id: string
  name: string // "owner/repo"
  description: string
  language: string
  starsToday: number
  url: string
}

export interface Tweet {
  id: string
  handle: string
  displayName: string
  text: string
  likes: number
  reposts: number
  postedAt: string // ISO datetime
}

export interface LinkedInData {
  stats: {
    followersTotal: number
    followersGainedYesterday: number
    post: { title: string; impressions: number; reactions: number; comments: number }
  }
  messages: LinkedInMessage[]
}

export interface LinkedInMessage {
  id: string
  from: string
  preview: string
  suggestedReply: string
  receivedAt: string // ISO datetime
}

export interface Todo {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  done: boolean
}

export interface YesterdayRecap {
  bullets: string[]
}

export interface UsageDay {
  tokens: number
  sessions: number
  costUsd: number
}

export interface UsageStats {
  yesterday: UsageDay
  dayBefore: UsageDay
}

export interface Reminder {
  id: string
  label: string
  type: 'birthday' | 'anniversary' | 'reminder'
  date: string // ISO date
}

export interface StockQuote {
  symbol: string
  price: number
  changePct: number // vs yesterday; negative = down
}
```

`src/data/DataProvider.ts`:
```ts
import type {
  CalendarEvent,
  CalendarSource,
  Email,
  LinkedInData,
  Mailbox,
  NewsItem,
  Quote,
  Reminder,
  RepoTrend,
  StockQuote,
  Todo,
  Tweet,
  UsageStats,
  YesterdayRecap,
} from './types'

/**
 * The backend contract. V1 ships MockDataProvider; backend integration
 * means implementing ApiDataProvider against this same interface and
 * swapping it in providerFactory.ts. See docs/INTEGRATION.md.
 */
export interface DataProvider {
  getQuote(): Promise<Quote>
  getCalendar(): Promise<{ sources: CalendarSource[]; events: CalendarEvent[] }>
  getEmails(): Promise<{ mailboxes: Mailbox[]; emails: Email[] }>
  getNews(): Promise<NewsItem[]>
  getRepoTrends(): Promise<RepoTrend[]>
  getTweets(): Promise<Tweet[]>
  getLinkedIn(): Promise<LinkedInData>
  getTodos(): Promise<Todo[]>
  getYesterdayRecap(): Promise<YesterdayRecap>
  getUsageStats(): Promise<UsageStats>
  getReminders(): Promise<Reminder[]>
  getStocks(): Promise<StockQuote[]>
}
```

`src/data/MockDataProvider.ts`:
```ts
import type { DataProvider } from './DataProvider'
import type {
  CalendarEvent,
  CalendarSource,
  Email,
  LinkedInData,
  Mailbox,
  NewsItem,
  Quote,
  Reminder,
  RepoTrend,
  StockQuote,
  Todo,
  Tweet,
  UsageStats,
  YesterdayRecap,
} from './types'

/** Today at hh:mm as an ISO string — keeps mock data always "current". */
function todayAt(h: number, m: number): string {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

const SOURCES: CalendarSource[] = [
  { id: 'work', name: 'Work', color: 'cyan' },
  { id: 'personal', name: 'Personal', color: 'green' },
  { id: 'side', name: 'Side project', color: 'violet' },
]

const MAILBOXES: Mailbox[] = [
  { id: 'work', name: 'Work', color: 'cyan' },
  { id: 'personal', name: 'Personal', color: 'green' },
  { id: 'newsletters', name: 'Newsletters', color: 'violet' },
]

export class MockDataProvider implements DataProvider {
  private latencyMs: number

  constructor(opts: { latencyMs?: number } = {}) {
    this.latencyMs = opts.latencyMs ?? 250
  }

  private wait<T>(value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), this.latencyMs))
  }

  getQuote = (): Promise<Quote> =>
    this.wait({
      text: 'The secret of getting ahead is getting started.',
      author: 'Mark Twain',
    })

  getCalendar = (): Promise<{ sources: CalendarSource[]; events: CalendarEvent[] }> =>
    this.wait({
      sources: SOURCES,
      events: [
        { id: 'e1', sourceId: 'work', title: 'Standup', start: todayAt(9, 30), end: todayAt(9, 45), meetLink: 'https://meet.example.com/standup' },
        { id: 'e2', sourceId: 'work', title: 'Design review — dashboard v2', start: todayAt(11, 0), end: todayAt(12, 0), location: 'Room 4B' },
        { id: 'e3', sourceId: 'personal', title: 'Gym — push day', start: todayAt(13, 0), end: todayAt(14, 0) },
        { id: 'e4', sourceId: 'work', title: '1:1 with Ana', start: todayAt(15, 30), end: todayAt(16, 0), meetLink: 'https://meet.example.com/ana' },
        { id: 'e5', sourceId: 'side', title: 'Copperkite investor sync', start: todayAt(18, 0), end: todayAt(18, 45), meetLink: 'https://meet.example.com/ck' },
      ],
    })

  getEmails = (): Promise<{ mailboxes: Mailbox[]; emails: Email[] }> =>
    this.wait({
      mailboxes: MAILBOXES,
      emails: [
        { id: 'm1', mailboxId: 'work', sender: 'Ana Duarte', subject: 'Q3 roadmap — final review', preview: 'Before our 1:1, can you look at the two open items…', receivedAt: todayAt(7, 12), unread: true },
        { id: 'm2', mailboxId: 'work', sender: 'GitHub', subject: 'PR #142 approved', preview: 'Your pull request "provider layer" was approved by…', receivedAt: todayAt(6, 48), unread: true },
        { id: 'm3', mailboxId: 'personal', sender: 'Dr. Mehta', subject: 'Appointment confirmed', preview: 'Your appointment on Friday at 5pm is confirmed…', receivedAt: todayAt(6, 5), unread: false },
        { id: 'm4', mailboxId: 'newsletters', sender: 'Benedict Evans', subject: 'AI and the next platform shift', preview: 'This week: what changes when agents do the browsing…', receivedAt: todayAt(5, 30), unread: true },
        { id: 'm5', mailboxId: 'personal', sender: 'Mom', subject: 'Weekend plans?', preview: 'Are you coming home this weekend? Dad wants to…', receivedAt: todayAt(4, 55), unread: false },
      ],
    })

  getNews = (): Promise<NewsItem[]> =>
    this.wait([
      { id: 'n1', category: 'tech', headline: 'Anthropic ships Claude 5 family with new Mythos tier', source: 'The Verge', publishedAt: todayAt(6, 40), url: 'https://example.com/n1' },
      { id: 'n2', category: 'tech', headline: 'Vite 6 RC lands with full ESM-only pipeline', source: 'InfoQ', publishedAt: todayAt(6, 10), url: 'https://example.com/n2' },
      { id: 'n3', category: 'tech', headline: 'EU passes landmark AI interoperability rules', source: 'Ars Technica', publishedAt: todayAt(5, 45), url: 'https://example.com/n3' },
      { id: 'n4', category: 'world', headline: 'Global markets rally as inflation cools', source: 'Reuters', publishedAt: todayAt(6, 55), url: 'https://example.com/n4' },
      { id: 'n5', category: 'world', headline: 'Monsoon arrives early across western India', source: 'BBC', publishedAt: todayAt(5, 20), url: 'https://example.com/n5' },
    ])

  getRepoTrends = (): Promise<RepoTrend[]> =>
    this.wait([
      { id: 'r1', name: 'anthropics/claude-code', description: 'Agentic coding in your terminal', language: 'TypeScript', starsToday: 842, url: 'https://github.com/anthropics/claude-code' },
      { id: 'r2', name: 'vitejs/vite', description: 'Next generation frontend tooling', language: 'TypeScript', starsToday: 311, url: 'https://github.com/vitejs/vite' },
      { id: 'r3', name: 'huggingface/transformers', description: 'State-of-the-art ML for everyone', language: 'Python', starsToday: 267, url: 'https://github.com/huggingface/transformers' },
    ])

  getTweets = (): Promise<Tweet[]> =>
    this.wait([
      { id: 't1', handle: '@paulg', displayName: 'Paul Graham', text: 'The best founders are relentlessly resourceful.', likes: 4200, reposts: 610, postedAt: todayAt(6, 30) },
      { id: 't2', handle: '@AnthropicAI', displayName: 'Anthropic', text: 'Fable 5 is now available to everyone. Here is what it can do →', likes: 9800, reposts: 2100, postedAt: todayAt(5, 50) },
      { id: 't3', handle: '@naval', displayName: 'Naval', text: 'Earn with your mind, not your time.', likes: 15600, reposts: 3400, postedAt: todayAt(4, 20) },
    ])

  getLinkedIn = (): Promise<LinkedInData> =>
    this.wait({
      stats: {
        followersTotal: 4382,
        followersGainedYesterday: 27,
        post: { title: 'Why I built my own morning dashboard', impressions: 12480, reactions: 214, comments: 31 },
      },
      messages: [
        { id: 'l1', from: 'Riya Kapoor', preview: 'Loved your post on dashboards — would you be open to a chat?', suggestedReply: 'Thanks Riya! Happy to chat — does Thursday afternoon work?', receivedAt: todayAt(7, 5) },
        { id: 'l2', from: 'Daniel Chen', preview: 'We are hiring a founding engineer, your profile stood out…', suggestedReply: 'Thanks for reaching out, Daniel. I am not looking right now, but let us stay connected.', receivedAt: todayAt(6, 20) },
      ],
    })

  getTodos = (): Promise<Todo[]> =>
    this.wait([
      { id: 'td1', text: 'Prep notes for design review', priority: 'high', done: false },
      { id: 'td2', text: 'Reply to Ana re: roadmap', priority: 'high', done: false },
      { id: 'td3', text: 'Book flights for Copperkite offsite', priority: 'medium', done: false },
      { id: 'td4', text: 'Renew domain', priority: 'low', done: true },
    ])

  getYesterdayRecap = (): Promise<YesterdayRecap> =>
    this.wait({
      bullets: [
        'Attended 4 meetings (2h 45m total)',
        'Handled 23 emails, inbox zero by 6pm',
        'Merged 3 PRs to copperkite/app',
        'Published 1 LinkedIn post — best performer this month',
      ],
    })

  getUsageStats = (): Promise<UsageStats> =>
    this.wait({
      yesterday: { tokens: 1_240_000, sessions: 14, costUsd: 38.2 },
      dayBefore: { tokens: 890_000, sessions: 9, costUsd: 26.7 },
    })

  getReminders = (): Promise<Reminder[]> =>
    this.wait([
      { id: 'rm1', label: "Mom's birthday", type: 'birthday', date: daysFromNow(2) },
      { id: 'rm2', label: 'Wedding anniversary', type: 'anniversary', date: daysFromNow(11) },
      { id: 'rm3', label: 'Car insurance renewal', type: 'reminder', date: daysFromNow(0) },
      { id: 'rm4', label: "Ravi's birthday", type: 'birthday', date: daysFromNow(19) },
    ])

  getStocks = (): Promise<StockQuote[]> =>
    this.wait([
      { symbol: 'AAPL', price: 232.14, changePct: 1.2 },
      { symbol: 'NVDA', price: 141.9, changePct: 3.4 },
      { symbol: 'TSLA', price: 249.51, changePct: -2.1 },
      { symbol: 'MSFT', price: 468.32, changePct: 0.6 },
      { symbol: 'GOOG', price: 192.77, changePct: -0.4 },
      { symbol: 'AMZN', price: 219.4, changePct: 1.8 },
      { symbol: 'META', price: 712.05, changePct: 0.9 },
      { symbol: 'TCS.NS', price: 3421.5, changePct: -1.3 },
      { symbol: 'RELIANCE.NS', price: 2987.2, changePct: 0.7 },
      { symbol: 'INFY.NS', price: 1854.6, changePct: 2.2 },
    ])
}
```

`src/data/providerFactory.ts`:
```ts
import type { DataProvider } from './DataProvider'
import { MockDataProvider } from './MockDataProvider'

/**
 * THE swap point. Backend day: return new ApiDataProvider(...) here.
 * Zero-latency in tests so widget tests stay fast and deterministic.
 */
const isTest = import.meta.env.MODE === 'test'

export const provider: DataProvider = new MockDataProvider(isTest ? { latencyMs: 0 } : {})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/data`
Expected: all contract tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: data contracts, DataProvider interface, MockDataProvider"
```

---

### Task 3: `useWidgetData` hook + `Panel` / `WidgetBody` shared components

**Files:**
- Create: `src/components/useWidgetData.ts`, `src/components/Panel.tsx`, `src/components/Panel.module.css`
- Test: `src/components/useWidgetData.test.tsx`, `src/components/Panel.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `useWidgetData<T>(fetcher: () => Promise<T>): { data: T | null; loading: boolean; error: boolean; retry: () => void }`
  - `Panel({ title, accent?, id?, children })` — widget chrome (section with heading).
  - `WidgetBody<T>({ data, loading, error, retry, isEmpty?, children })` — renders skeleton/error/empty or `children(data)`.

- [ ] **Step 1: Write failing tests**

`src/components/useWidgetData.test.tsx`:
```tsx
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWidgetData } from './useWidgetData'

it('goes loading → data', async () => {
  const fetcher = () => Promise.resolve('hello')
  const { result } = renderHook(() => useWidgetData(fetcher))
  expect(result.current.loading).toBe(true)
  await waitFor(() => expect(result.current.data).toBe('hello'))
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBe(false)
})

it('goes loading → error, and retry refetches', async () => {
  let calls = 0
  const fetcher = () => {
    calls++
    return calls === 1 ? Promise.reject(new Error('boom')) : Promise.resolve('recovered')
  }
  const { result } = renderHook(() => useWidgetData(fetcher))
  await waitFor(() => expect(result.current.error).toBe(true))
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.data).toBe('recovered'))
})
```

`src/components/Panel.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Panel, WidgetBody } from './Panel'

it('renders title and children', () => {
  render(
    <Panel title="Calendar" accent="cyan" id="calendar">
      <p>body</p>
    </Panel>,
  )
  expect(screen.getByRole('heading', { name: 'Calendar' })).toBeInTheDocument()
  expect(screen.getByText('body')).toBeInTheDocument()
})

it('WidgetBody shows skeleton, error+retry, empty, and data states', async () => {
  const retry = vi.fn()
  const base = { retry, isEmpty: (d: string[]) => d.length === 0 }

  const { rerender } = render(
    <WidgetBody data={null} loading={true} error={false} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  expect(screen.getByTestId('skeleton')).toBeInTheDocument()

  rerender(
    <WidgetBody data={null} loading={false} error={true} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  await userEvent.click(screen.getByRole('button', { name: /retry/i }))
  expect(retry).toHaveBeenCalled()

  rerender(
    <WidgetBody data={[]} loading={false} error={false} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  expect(screen.getByText(/enjoy the quiet/i)).toBeInTheDocument()

  rerender(
    <WidgetBody data={['a', 'b']} loading={false} error={false} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  expect(screen.getByText('a,b')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement hook and components**

`src/components/useWidgetData.ts`:
```ts
import { useCallback, useEffect, useState } from 'react'

interface WidgetState<T> {
  data: T | null
  loading: boolean
  error: boolean
}

/**
 * Uniform data lifecycle for every widget. `fetcher` MUST be referentially
 * stable (provider methods are arrow-function class properties, so passing
 * `provider.getX` directly is safe).
 */
export function useWidgetData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<WidgetState<T>>({ data: null, loading: true, error: false })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: false })
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, loading: false, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { ...state, retry }
}
```

`src/components/Panel.tsx`:
```tsx
import type { ReactNode } from 'react'
import type { AccentColor } from '../data/types'
import styles from './Panel.module.css'

interface PanelProps {
  title: string
  accent?: AccentColor
  id?: string
  children: ReactNode
}

export function Panel({ title, accent = 'cyan', id, children }: PanelProps) {
  return (
    <section className={styles.panel} id={id} data-accent={accent}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

interface WidgetBodyProps<T> {
  data: T | null
  loading: boolean
  error: boolean
  retry: () => void
  isEmpty?: (data: T) => boolean
  children: (data: T) => ReactNode
}

export function WidgetBody<T>({ data, loading, error, retry, isEmpty, children }: WidgetBodyProps<T>) {
  if (loading) {
    return (
      <div className={styles.skeleton} data-testid="skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    )
  }
  if (error || data === null) {
    return (
      <p className={styles.state}>
        Couldn&rsquo;t load.{' '}
        <button className={styles.retry} onClick={retry}>
          Retry
        </button>
      </p>
    )
  }
  if (isEmpty?.(data)) {
    return <p className={styles.state}>Nothing here — enjoy the quiet.</p>
  }
  return <>{children(data)}</>
}
```

`src/components/Panel.module.css`:
```css
.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: border-color 0.3s;
}

.panel:hover {
  border-color: color-mix(in srgb, var(--border) 60%, var(--accent-cyan));
}

.title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.panel[data-accent='green'] .title { color: var(--accent-green); }
.panel[data-accent='violet'] .title { color: var(--accent-violet); }
.panel[data-accent='rose'] .title { color: var(--accent-rose); }
.panel[data-accent='cyan'] .title { color: var(--text-secondary); }

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.skeleton span {
  display: block;
  height: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, var(--bg-raised) 25%, var(--border) 50%, var(--bg-raised) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skeleton span:nth-child(2) { width: 80%; }
.skeleton span:nth-child(3) { width: 60%; }

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.state {
  color: var(--text-secondary);
  font-size: 13px;
}

.retry {
  color: var(--accent-cyan);
  text-decoration: underline;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: useWidgetData hook and Panel/WidgetBody shared components"
```

---

### Task 4: App shell — TopBar (quote + live clock), Sidebar, DashboardGrid

**Files:**
- Create: `src/shell/TopBar.tsx`, `src/shell/TopBar.module.css`, `src/shell/Sidebar.tsx`, `src/shell/Sidebar.module.css`, `src/shell/DashboardGrid.tsx`, `src/shell/DashboardGrid.module.css`
- Modify: `src/App.tsx`, `src/App.test.tsx`
- Test: `src/shell/TopBar.test.tsx`, `src/shell/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `provider.getQuote`, `useWidgetData`.
- Produces: `DashboardGrid` renders one wrapper div per grid area with these class names and element ids that later tasks fill: `calendar`, `emails`, `news`, `tweets`, `linkedin`, `todos`, `recap`, `usage`, `reminders`. Later widget tasks replace the placeholder `<div>` contents inside the matching wrapper.

- [ ] **Step 1: Write failing tests**

`src/shell/TopBar.test.tsx`:
```tsx
import { act, render, screen } from '@testing-library/react'
import { TopBar } from './TopBar'

it('shows the daily quote from the provider', async () => {
  render(<TopBar />)
  expect(await screen.findByText(/getting started/i)).toBeInTheDocument()
  expect(screen.getByText(/mark twain/i)).toBeInTheDocument()
})

it('renders a live clock that ticks every second', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-03T08:15:00'))
  render(<TopBar />)
  expect(screen.getByTestId('clock')).toHaveTextContent('08:15:00')
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByTestId('clock')).toHaveTextContent('08:15:01')
  vi.useRealTimers()
})
```

`src/shell/Sidebar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'

it('scrolls to the target widget on click', async () => {
  const target = document.createElement('section')
  target.id = 'calendar'
  target.scrollIntoView = vi.fn()
  document.body.appendChild(target)

  render(<Sidebar />)
  await userEvent.click(screen.getByRole('button', { name: /calendar/i }))
  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  target.remove()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/shell`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement shell components**

`src/shell/TopBar.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { provider } from '../data/providerFactory'
import { useWidgetData } from '../components/useWidgetData'
import styles from './TopBar.module.css'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('en-GB', { hour12: false })
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={styles.clockWrap}>
      <span className={styles.date}>{date}</span>
      <span className={styles.time} data-testid="clock">
        {time}
      </span>
    </div>
  )
}

export function TopBar() {
  const { data } = useWidgetData(provider.getQuote)
  return (
    <header className={styles.topbar} id="top">
      <p className={styles.quote}>
        {data ? (
          <>
            <span className={styles.quoteText}>&ldquo;{data.text}&rdquo;</span>
            <span className={styles.author}> — {data.author}</span>
          </>
        ) : (
          <span className={styles.quoteText}>&nbsp;</span>
        )}
      </p>
      <Clock />
    </header>
  )
}
```

`src/shell/TopBar.module.css`:
```css
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}

.quote {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 20px;
  font-style: italic;
  color: var(--text-primary);
  border-left: 2px solid var(--accent-green);
  padding-left: 14px;
}

.author {
  color: var(--text-secondary);
  font-size: 15px;
  font-style: normal;
}

.clockWrap {
  text-align: right;
  flex-shrink: 0;
}

.date {
  display: block;
  color: var(--text-secondary);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.time {
  font-size: 26px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--accent-cyan);
  text-shadow: var(--glow-cyan);
}
```

`src/shell/Sidebar.tsx`:
```tsx
import styles from './Sidebar.module.css'

const ITEMS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'top', label: 'Overview', icon: '◆' },
  { id: 'emails', label: 'Messages', icon: '✉' },
  { id: 'calendar', label: 'Calendar', icon: '▦' },
  { id: 'news', label: 'News', icon: '☰' },
  { id: 'todos', label: 'To-Do', icon: '✓' },
]

export function Sidebar() {
  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav className={styles.sidebar} aria-label="Sections">
      {ITEMS.map((item) => (
        <button key={item.id} className={styles.item} onClick={() => go(item.id)} title={item.label}>
          <span aria-hidden="true" className={styles.icon}>
            {item.icon}
          </span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
```

`src/shell/Sidebar.module.css`:
```css
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 8px;
  border-right: 1px solid var(--border);
  width: 76px;
  flex-shrink: 0;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: color 0.2s, background 0.2s;
}

.item:hover {
  color: var(--accent-cyan);
  background: var(--bg-raised);
}

.icon {
  font-size: 16px;
}

.label {
  font-size: 10px;
  letter-spacing: 0.04em;
}

@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: auto;
    flex-direction: row;
    justify-content: space-around;
    border-right: none;
    border-top: 1px solid var(--border);
    background: var(--bg-panel);
    padding: 6px 8px;
    z-index: 10;
  }
}
```

`src/shell/DashboardGrid.tsx` (placeholders — each widget task replaces one wrapper's contents):
```tsx
import styles from './DashboardGrid.module.css'

export function DashboardGrid() {
  return (
    <main className={styles.grid}>
      <div className={styles.calendar} id="calendar" />
      <div className={styles.news} id="news" />
      <div className={styles.tweets} id="tweets" />
      <div className={styles.emails} id="emails" />
      <div className={styles.linkedin} id="linkedin" />
      <div className={styles.todos} id="todos" />
      <div className={styles.recap} id="recap" />
      <div className={styles.usage} id="usage" />
      <div className={styles.reminders} id="reminders" />
    </main>
  )
}
```

`src/shell/DashboardGrid.module.css`:
```css
.grid {
  flex: 1;
  display: grid;
  gap: var(--gap);
  padding: var(--gap) 24px;
  grid-template-columns: 1.15fr 1fr 1fr 1fr;
  grid-template-rows: minmax(260px, auto) minmax(220px, auto) minmax(200px, auto);
  grid-template-areas:
    'calendar news news tweets'
    'emails linkedin linkedin linkedin'
    'todos recap usage reminders';
  min-width: 0;
}

.grid > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  animation: fadeUp 0.5s both;
}

.grid > div:nth-child(2) { animation-delay: 60ms; }
.grid > div:nth-child(3) { animation-delay: 120ms; }
.grid > div:nth-child(4) { animation-delay: 180ms; }
.grid > div:nth-child(5) { animation-delay: 240ms; }
.grid > div:nth-child(6) { animation-delay: 300ms; }
.grid > div:nth-child(7) { animation-delay: 360ms; }
.grid > div:nth-child(8) { animation-delay: 420ms; }
.grid > div:nth-child(9) { animation-delay: 480ms; }

.grid > div > section {
  flex: 1;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.calendar { grid-area: calendar; }
.news { grid-area: news; }
.tweets { grid-area: tweets; }
.emails { grid-area: emails; }
.linkedin { grid-area: linkedin; }
.todos { grid-area: todos; }
.recap { grid-area: recap; }
.usage { grid-area: usage; }
.reminders { grid-area: reminders; }

@media (max-width: 1199px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      'calendar news'
      'emails tweets'
      'linkedin linkedin'
      'todos recap'
      'usage reminders';
  }
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'calendar' 'emails' 'news' 'tweets' 'linkedin' 'todos' 'recap' 'usage' 'reminders';
    padding-bottom: 72px; /* clear the fixed bottom sidebar */
  }
}
```

Update `src/App.tsx`:
```tsx
import { Sidebar } from './shell/Sidebar'
import { TopBar } from './shell/TopBar'
import { DashboardGrid } from './shell/DashboardGrid'

export function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <DashboardGrid />
      </div>
    </div>
  )
}
```

Update `src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { App } from './App'

it('renders topbar clock and sidebar navigation', () => {
  render(<App />)
  expect(screen.getByTestId('clock')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: /sections/i })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: PASS (data, components, shell, App).

- [ ] **Step 5: Visual smoke check**

Run: `npm run dev` — open http://localhost:5173, confirm: quote appears after brief delay, clock ticks, dark polar palette, empty grid cells invisible (no borders yet — they're bare divs). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: app shell — TopBar with live clock, Sidebar nav, dashboard grid"
```

---

### Task 5: Calendar widget

**Files:**
- Create: `src/widgets/Calendar/CalendarWidget.tsx`, `src/widgets/Calendar/CalendarWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill the `calendar` wrapper)
- Test: `src/widgets/Calendar/CalendarWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getCalendar`, `Panel`, `WidgetBody`, `useWidgetData`, `AccentColor`.
- Produces: `CalendarWidget` (no props).

- [ ] **Step 1: Write failing test**

`src/widgets/Calendar/CalendarWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { CalendarWidget } from './CalendarWidget'
import { provider } from '../../data/providerFactory'

it('renders today’s events with source color dots', async () => {
  render(<CalendarWidget />)
  expect(await screen.findByText('Standup')).toBeInTheDocument()
  expect(screen.getByText(/design review/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('source-dot').length).toBeGreaterThan(2)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getCalendar').mockRejectedValueOnce(new Error('down'))
  render(<CalendarWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/widgets/Calendar`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement widget**

`src/widgets/Calendar/CalendarWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './CalendarWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function CalendarWidget() {
  const state = useWidgetData(provider.getCalendar)
  return (
    <Panel title="Today" accent="cyan" id="calendar">
      <WidgetBody {...state} isEmpty={(d) => d.events.length === 0}>
        {({ sources, events }) => {
          const colorOf = (sourceId: string) =>
            sources.find((s) => s.id === sourceId)?.color ?? 'cyan'
          const now = Date.now()
          return (
            <ul className={styles.list}>
              {events.map((e) => {
                const past = new Date(e.end).getTime() < now
                return (
                  <li key={e.id} className={past ? styles.past : styles.event}>
                    <span className={styles.time}>{fmt(e.start)}</span>
                    <span
                      className={styles.dot}
                      data-testid="source-dot"
                      data-color={colorOf(e.sourceId)}
                    />
                    <span className={styles.details}>
                      <span className={styles.title}>{e.title}</span>
                      {(e.location || e.meetLink) && (
                        <span className={styles.meta}>{e.location ?? 'Video call ↗'}</span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Calendar/CalendarWidget.module.css`:
```css
.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.event,
.past {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.past {
  opacity: 0.45;
}

.time {
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
  font-size: 12px;
  width: 40px;
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
}
.dot[data-color='cyan'] { background: var(--accent-cyan); }
.dot[data-color='green'] { background: var(--accent-green); }
.dot[data-color='violet'] { background: var(--accent-violet); }
.dot[data-color='rose'] { background: var(--accent-rose); }

.details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  color: var(--text-secondary);
  font-size: 12px;
}
```

Modify `src/shell/DashboardGrid.tsx` — replace the calendar placeholder line and add the import:
```tsx
import { CalendarWidget } from '../widgets/Calendar/CalendarWidget'
```
```tsx
      <div className={styles.calendar}>
        <CalendarWidget />
      </div>
```
(The `id="calendar"` moves off the wrapper — `Panel` provides it. Remove `id` from the wrapper div.)

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets/Calendar`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: consolidated calendar widget with color-coded sources"
```

---

### Task 6: Important Emails widget

**Files:**
- Create: `src/widgets/Emails/EmailsWidget.tsx`, `src/widgets/Emails/EmailsWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill `emails` wrapper, remove its `id`)
- Test: `src/widgets/Emails/EmailsWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getEmails`, shared components.
- Produces: `EmailsWidget` (no props).

- [ ] **Step 1: Write failing test**

`src/widgets/Emails/EmailsWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { EmailsWidget } from './EmailsWidget'

it('renders emails with sender, subject, and mailbox dot', async () => {
  render(<EmailsWidget />)
  expect(await screen.findByText('Ana Duarte')).toBeInTheDocument()
  expect(screen.getByText(/q3 roadmap/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('mailbox-dot').length).toBeGreaterThan(2)
})

it('marks unread emails', async () => {
  render(<EmailsWidget />)
  await screen.findByText('Ana Duarte')
  expect(screen.getAllByTestId('unread-dot').length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/widgets/Emails`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement widget**

`src/widgets/Emails/EmailsWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './EmailsWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function EmailsWidget() {
  const state = useWidgetData(provider.getEmails)
  return (
    <Panel title="Important Emails" accent="rose" id="emails">
      <WidgetBody {...state} isEmpty={(d) => d.emails.length === 0}>
        {({ mailboxes, emails }) => {
          const colorOf = (id: string) => mailboxes.find((m) => m.id === id)?.color ?? 'cyan'
          return (
            <ul className={styles.list}>
              {emails.map((e) => (
                <li key={e.id} className={e.unread ? styles.unread : styles.email}>
                  <span className={styles.dot} data-testid="mailbox-dot" data-color={colorOf(e.mailboxId)} />
                  <span className={styles.content}>
                    <span className={styles.row}>
                      <span className={styles.sender}>{e.sender}</span>
                      <span className={styles.time}>{fmt(e.receivedAt)}</span>
                    </span>
                    <span className={styles.subject}>
                      {e.subject}
                      {e.unread && <span className={styles.unreadDot} data-testid="unread-dot" />}
                    </span>
                    <span className={styles.preview}>{e.preview}</span>
                  </span>
                </li>
              ))}
            </ul>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Emails/EmailsWidget.module.css`:
```css
.list {
  list-style: none;
  padding: 0;
}

.email,
.unread {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.email { opacity: 0.7; }

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.dot[data-color='cyan'] { background: var(--accent-cyan); }
.dot[data-color='green'] { background: var(--accent-green); }
.dot[data-color='violet'] { background: var(--accent-violet); }
.dot[data-color='rose'] { background: var(--accent-rose); }

.content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.sender { font-weight: 600; font-size: 13px; }
.time { color: var(--text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }

.subject {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unreadDot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-rose);
  margin-left: 6px;
  vertical-align: middle;
}

.preview {
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

Modify `src/shell/DashboardGrid.tsx`:
```tsx
import { EmailsWidget } from '../widgets/Emails/EmailsWidget'
```
```tsx
      <div className={styles.emails}>
        <EmailsWidget />
      </div>
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets/Emails`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: important emails widget color-coded by mailbox"
```

---

### Task 7: News + GitHub widget (tabbed)

**Files:**
- Create: `src/widgets/News/NewsWidget.tsx`, `src/widgets/News/NewsWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill `news` wrapper, remove its `id`)
- Test: `src/widgets/News/NewsWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getNews`, `provider.getRepoTrends`, shared components.
- Produces: `NewsWidget` (no props).

- [ ] **Step 1: Write failing test**

`src/widgets/News/NewsWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsWidget } from './NewsWidget'

it('shows tech news by default and switches tabs', async () => {
  render(<NewsWidget />)
  expect(await screen.findByText(/claude 5 family/i)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('tab', { name: /world/i }))
  expect(await screen.findByText(/markets rally/i)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('tab', { name: /github/i }))
  expect(await screen.findByText('anthropics/claude-code')).toBeInTheDocument()
  expect(screen.getByText(/\+842/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/widgets/News`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement widget**

`src/widgets/News/NewsWidget.tsx`:
```tsx
import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './NewsWidget.module.css'

type Tab = 'tech' | 'world' | 'github'

export function NewsWidget() {
  const [tab, setTab] = useState<Tab>('tech')
  const news = useWidgetData(provider.getNews)
  const repos = useWidgetData(provider.getRepoTrends)

  return (
    <Panel title="News & GitHub" accent="cyan" id="news">
      <div className={styles.tabs} role="tablist">
        {(['tech', 'world', 'github'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? styles.tabActive : styles.tab}
            onClick={() => setTab(t)}
          >
            {t === 'github' ? 'GitHub' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'github' ? (
        <WidgetBody {...repos} isEmpty={(d) => d.length === 0}>
          {(list) => (
            <ul className={styles.list}>
              {list.map((r) => (
                <li key={r.id} className={styles.item}>
                  <span className={styles.headline}>{r.name}</span>
                  <span className={styles.meta}>
                    {r.description} · {r.language} · <span className={styles.stars}>+{r.starsToday} ★</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </WidgetBody>
      ) : (
        <WidgetBody {...news} isEmpty={(d) => d.filter((n) => n.category === tab).length === 0}>
          {(list) => (
            <ul className={styles.list}>
              {list
                .filter((n) => n.category === tab)
                .map((n) => (
                  <li key={n.id} className={styles.item}>
                    <span className={styles.headline}>{n.headline}</span>
                    <span className={styles.meta}>
                      {n.source} ·{' '}
                      {new Date(n.publishedAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </WidgetBody>
      )}
    </Panel>
  )
}
```

`src/widgets/News/NewsWidget.module.css`:
```css
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.tab,
.tabActive {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--text-secondary);
}

.tabActive {
  color: var(--accent-cyan);
  background: var(--bg-raised);
}

.list {
  list-style: none;
  padding: 0;
}

.item {
  display: flex;
  flex-direction: column;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
}

.headline {
  font-size: 13px;
  font-weight: 500;
}

.meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.stars {
  color: var(--accent-green);
}
```

Modify `src/shell/DashboardGrid.tsx`:
```tsx
import { NewsWidget } from '../widgets/News/NewsWidget'
```
```tsx
      <div className={styles.news}>
        <NewsWidget />
      </div>
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets/News`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: tabbed news + GitHub trending widget"
```

---

### Task 8: Tweets widget

**Files:**
- Create: `src/widgets/Tweets/TweetsWidget.tsx`, `src/widgets/Tweets/TweetsWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill `tweets` wrapper, remove its `id`)
- Test: `src/widgets/Tweets/TweetsWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getTweets`, shared components.
- Produces: `TweetsWidget` (no props).

- [ ] **Step 1: Write failing test**

`src/widgets/Tweets/TweetsWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { TweetsWidget } from './TweetsWidget'

it('renders tweets with handle and engagement', async () => {
  render(<TweetsWidget />)
  expect(await screen.findByText('@paulg')).toBeInTheDocument()
  expect(screen.getByText(/relentlessly resourceful/i)).toBeInTheDocument()
  expect(screen.getByText('4.2k')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/widgets/Tweets`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement widget**

`src/widgets/Tweets/TweetsWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './TweetsWidget.module.css'

export function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n)
}

export function TweetsWidget() {
  const state = useWidgetData(provider.getTweets)
  return (
    <Panel title="Tweets" accent="violet" id="tweets">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(tweets) => (
          <ul className={styles.list}>
            {tweets.map((t) => (
              <li key={t.id} className={styles.tweet}>
                <span className={styles.avatar} aria-hidden="true">
                  {t.displayName[0]}
                </span>
                <span className={styles.content}>
                  <span className={styles.name}>
                    {t.displayName} <span className={styles.handle}>{t.handle}</span>
                  </span>
                  <span className={styles.text}>{t.text}</span>
                  <span className={styles.engagement}>
                    ♥ {compact(t.likes)} · ⇄ {compact(t.reposts)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Tweets/TweetsWidget.module.css`:
```css
.list {
  list-style: none;
  padding: 0;
}

.tweet {
  display: flex;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-raised);
  color: var(--accent-violet);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name { font-weight: 600; font-size: 13px; }
.handle { color: var(--text-secondary); font-weight: 400; }
.text { font-size: 13px; }
.engagement { color: var(--text-secondary); font-size: 12px; }
```

Modify `src/shell/DashboardGrid.tsx`:
```tsx
import { TweetsWidget } from '../widgets/Tweets/TweetsWidget'
```
```tsx
      <div className={styles.tweets}>
        <TweetsWidget />
      </div>
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets/Tweets`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scrollable tweets widget"
```

---

### Task 9: LinkedIn widget (stats + messages with suggested replies)

**Files:**
- Create: `src/widgets/LinkedIn/LinkedInWidget.tsx`, `src/widgets/LinkedIn/LinkedInWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill `linkedin` wrapper, remove its `id`)
- Test: `src/widgets/LinkedIn/LinkedInWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getLinkedIn`, shared components.
- Produces: `LinkedInWidget` (no props).

- [ ] **Step 1: Write failing test**

`src/widgets/LinkedIn/LinkedInWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinkedInWidget } from './LinkedInWidget'

it('renders follower delta, post stats, and messages', async () => {
  render(<LinkedInWidget />)
  expect(await screen.findByText('+27')).toBeInTheDocument()
  expect(screen.getByText(/12,480/)).toBeInTheDocument()
  expect(screen.getByText('Riya Kapoor')).toBeInTheDocument()
})

it('copies the suggested reply to clipboard', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<LinkedInWidget />)
  await screen.findByText('Riya Kapoor')
  await userEvent.click(screen.getAllByRole('button', { name: /copy reply/i })[0])
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Thanks Riya'))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/widgets/LinkedIn`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement widget**

`src/widgets/LinkedIn/LinkedInWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './LinkedInWidget.module.css'

export function LinkedInWidget() {
  const state = useWidgetData(provider.getLinkedIn)
  return (
    <Panel title="LinkedIn" accent="violet" id="linkedin">
      <WidgetBody {...state}>
        {({ stats, messages }) => (
          <div className={styles.columns}>
            <div className={styles.col}>
              <span className={styles.label}>Followers gained</span>
              <span className={styles.big}>+{stats.followersGainedYesterday}</span>
              <span className={styles.sub}>{stats.followersTotal.toLocaleString('en-US')} total</span>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Yesterday&rsquo;s post</span>
              <span className={styles.postTitle}>{stats.post.title}</span>
              <span className={styles.sub}>
                {stats.post.impressions.toLocaleString('en-US')} impressions · {stats.post.reactions}{' '}
                reactions · {stats.post.comments} comments
              </span>
            </div>
            <div className={styles.colWide}>
              <span className={styles.label}>Messages</span>
              <ul className={styles.messages}>
                {messages.map((m) => (
                  <li key={m.id} className={styles.message}>
                    <span className={styles.from}>{m.from}</span>
                    <span className={styles.preview}>{m.preview}</span>
                    <button
                      className={styles.reply}
                      onClick={() => navigator.clipboard.writeText(m.suggestedReply)}
                      title={m.suggestedReply}
                    >
                      ✦ Copy reply
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/LinkedIn/LinkedInWidget.module.css`:
```css
.columns {
  display: grid;
  grid-template-columns: 1fr 1.4fr 2fr;
  gap: 20px;
  height: 100%;
}

.col,
.colWide {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.label {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.big {
  font-size: 30px;
  font-weight: 600;
  color: var(--accent-green);
  font-variant-numeric: tabular-nums;
}

.sub { color: var(--text-secondary); font-size: 12px; }
.postTitle { font-weight: 500; font-size: 14px; }

.messages {
  list-style: none;
  padding: 0;
  overflow-y: auto;
}

.message {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.from { font-weight: 600; font-size: 13px; }
.preview { color: var(--text-secondary); font-size: 12px; }

.reply {
  align-self: flex-start;
  color: var(--accent-violet);
  font-size: 12px;
  padding: 2px 0;
}

.reply:hover { text-decoration: underline; }

@media (max-width: 767px) {
  .columns { grid-template-columns: 1fr; }
}
```

Modify `src/shell/DashboardGrid.tsx`:
```tsx
import { LinkedInWidget } from '../widgets/LinkedIn/LinkedInWidget'
```
```tsx
      <div className={styles.linkedin}>
        <LinkedInWidget />
      </div>
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets/LinkedIn`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: LinkedIn stats + messages widget with copyable suggested replies"
```

---

### Task 10: To-Do widget (check-off, local state)

**Files:**
- Create: `src/widgets/Todos/TodosWidget.tsx`, `src/widgets/Todos/TodosWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill `todos` wrapper, remove its `id`)
- Test: `src/widgets/Todos/TodosWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getTodos`, shared components, `Todo` type.
- Produces: `TodosWidget` (no props).

- [ ] **Step 1: Write failing test**

`src/widgets/Todos/TodosWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodosWidget } from './TodosWidget'

it('renders todos and toggles done state on click', async () => {
  render(<TodosWidget />)
  const item = await screen.findByRole('checkbox', { name: /prep notes/i })
  expect(item).not.toBeChecked()
  await userEvent.click(item)
  expect(item).toBeChecked()
})

it('renders already-done todos as checked', async () => {
  render(<TodosWidget />)
  expect(await screen.findByRole('checkbox', { name: /renew domain/i })).toBeChecked()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/widgets/Todos`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement widget**

`src/widgets/Todos/TodosWidget.tsx`:
```tsx
import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import type { Todo } from '../../data/types'
import styles from './TodosWidget.module.css'

function TodoList({ initial }: { initial: Todo[] }) {
  const [todos, setTodos] = useState(initial)
  const toggle = (id: string) =>
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  return (
    <ul className={styles.list}>
      {todos.map((t) => (
        <li key={t.id} className={styles.item} data-priority={t.priority}>
          <label className={t.done ? styles.done : styles.label}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span>{t.text}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export function TodosWidget() {
  const state = useWidgetData(provider.getTodos)
  return (
    <Panel title="To-Do" accent="green" id="todos">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(todos) => <TodoList initial={todos} />}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Todos/TodosWidget.module.css`:
```css
.list {
  list-style: none;
  padding: 0;
}

.item {
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent;
  padding-left: 8px;
}

.item[data-priority='high'] { border-left-color: var(--accent-rose); }
.item[data-priority='medium'] { border-left-color: var(--accent-cyan); }

.label,
.done {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
}

.done span {
  text-decoration: line-through;
  color: var(--accent-green);
  opacity: 0.7;
}

.label input,
.done input {
  accent-color: var(--accent-green);
}
```

Modify `src/shell/DashboardGrid.tsx`:
```tsx
import { TodosWidget } from '../widgets/Todos/TodosWidget'
```
```tsx
      <div className={styles.todos}>
        <TodosWidget />
      </div>
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets/Todos`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: to-do widget with local check-off state"
```

---

### Task 11: Yesterday Recap, Claude Code usage, Reminders widgets

**Files:**
- Create: `src/widgets/Recap/RecapWidget.tsx`, `src/widgets/Recap/RecapWidget.module.css`, `src/widgets/Usage/UsageWidget.tsx`, `src/widgets/Usage/UsageWidget.module.css`, `src/widgets/Reminders/RemindersWidget.tsx`, `src/widgets/Reminders/RemindersWidget.module.css`
- Modify: `src/shell/DashboardGrid.tsx` (fill `recap`, `usage`, `reminders` wrappers, remove their `id`s)
- Test: `src/widgets/Recap/RecapWidget.test.tsx`, `src/widgets/Usage/UsageWidget.test.tsx`, `src/widgets/Reminders/RemindersWidget.test.tsx`

**Interfaces:**
- Consumes: `provider.getYesterdayRecap`, `provider.getUsageStats`, `provider.getReminders`, shared components.
- Produces: `RecapWidget`, `UsageWidget`, `RemindersWidget` (no props).

- [ ] **Step 1: Write failing tests**

`src/widgets/Recap/RecapWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { RecapWidget } from './RecapWidget'

it('renders recap bullets', async () => {
  render(<RecapWidget />)
  expect(await screen.findByText(/attended 4 meetings/i)).toBeInTheDocument()
  expect(screen.getByText(/merged 3 prs/i)).toBeInTheDocument()
})
```

`src/widgets/Usage/UsageWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { UsageWidget } from './UsageWidget'

it('renders yesterday tokens, sessions, cost and comparison bars', async () => {
  render(<UsageWidget />)
  expect(await screen.findByText('1.2M')).toBeInTheDocument()
  expect(screen.getByText(/14 sessions/i)).toBeInTheDocument()
  expect(screen.getByText('$38.20')).toBeInTheDocument()
  expect(screen.getAllByTestId('usage-bar')).toHaveLength(2)
})
```

`src/widgets/Reminders/RemindersWidget.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { RemindersWidget } from './RemindersWidget'

it('renders reminders with days-until countdown', async () => {
  render(<RemindersWidget />)
  expect(await screen.findByText(/mom's birthday/i)).toBeInTheDocument()
  expect(screen.getByText(/in 2 days/i)).toBeInTheDocument()
  expect(screen.getByText(/today/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/widgets/Recap src/widgets/Usage src/widgets/Reminders`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the three widgets**

`src/widgets/Recap/RecapWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './RecapWidget.module.css'

export function RecapWidget() {
  const state = useWidgetData(provider.getYesterdayRecap)
  return (
    <Panel title="Yesterday Recap" accent="cyan" id="recap">
      <WidgetBody {...state} isEmpty={(d) => d.bullets.length === 0}>
        {({ bullets }) => (
          <ul className={styles.list}>
            {bullets.map((b, i) => (
              <li key={i} className={styles.bullet}>
                {b}
              </li>
            ))}
          </ul>
        )}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Recap/RecapWidget.module.css`:
```css
.list {
  list-style: none;
  padding: 0;
}

.bullet {
  position: relative;
  padding: 5px 0 5px 16px;
  font-size: 13px;
}

.bullet::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-cyan);
  opacity: 0.7;
}
```

`src/widgets/Usage/UsageWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './UsageWidget.module.css'

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return String(n)
}

export function UsageWidget() {
  const state = useWidgetData(provider.getUsageStats)
  return (
    <Panel title="Claude Code Usage" accent="cyan" id="usage">
      <WidgetBody {...state}>
        {({ yesterday, dayBefore }) => {
          const max = Math.max(yesterday.tokens, dayBefore.tokens)
          return (
            <div className={styles.wrap}>
              <div className={styles.headline}>
                <span className={styles.big}>{fmtTokens(yesterday.tokens)}</span>
                <span className={styles.sub}>
                  tokens · {yesterday.sessions} sessions · ${yesterday.costUsd.toFixed(2)}
                </span>
              </div>
              <div className={styles.chart}>
                {[
                  { label: 'Yesterday', day: yesterday },
                  { label: 'Day before', day: dayBefore },
                ].map(({ label, day }) => (
                  <div key={label} className={styles.row}>
                    <span className={styles.rowLabel}>{label}</span>
                    <span className={styles.barTrack}>
                      <span
                        className={styles.bar}
                        data-testid="usage-bar"
                        style={{ width: `${(day.tokens / max) * 100}%` }}
                      />
                    </span>
                    <span className={styles.rowValue}>{fmtTokens(day.tokens)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Usage/UsageWidget.module.css`:
```css
.wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.big {
  font-size: 30px;
  font-weight: 600;
  color: var(--accent-cyan);
  font-variant-numeric: tabular-nums;
  margin-right: 8px;
}

.sub { color: var(--text-secondary); font-size: 12px; }

.chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.rowLabel { width: 70px; color: var(--text-secondary); flex-shrink: 0; }

.barTrack {
  flex: 1;
  height: 8px;
  background: var(--bg-raised);
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-violet));
  border-radius: 4px;
}

.rowValue {
  width: 44px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}
```

`src/widgets/Reminders/RemindersWidget.tsx`:
```tsx
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './RemindersWidget.module.css'

const ICONS: Record<string, string> = { birthday: '🎂', anniversary: '💍', reminder: '⏰' }

export function daysUntil(iso: string): number {
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function countdown(n: number): string {
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  return `in ${n} days`
}

export function RemindersWidget() {
  const state = useWidgetData(provider.getReminders)
  return (
    <Panel title="Reminders" accent="green" id="reminders">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(reminders) => (
          <ul className={styles.list}>
            {[...reminders]
              .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
              .map((r) => {
                const n = daysUntil(r.date)
                return (
                  <li key={r.id} className={n === 0 ? styles.today : styles.item}>
                    <span aria-hidden="true">{ICONS[r.type]}</span>
                    <span className={styles.label}>{r.label}</span>
                    <span className={styles.when}>{countdown(n)}</span>
                  </li>
                )
              })}
          </ul>
        )}
      </WidgetBody>
    </Panel>
  )
}
```

`src/widgets/Reminders/RemindersWidget.module.css`:
```css
.list {
  list-style: none;
  padding: 0;
}

.item,
.today {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.today .label,
.today .when {
  color: var(--accent-green);
  font-weight: 600;
}

.label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.when {
  color: var(--text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}
```

Modify `src/shell/DashboardGrid.tsx`:
```tsx
import { RecapWidget } from '../widgets/Recap/RecapWidget'
import { UsageWidget } from '../widgets/Usage/UsageWidget'
import { RemindersWidget } from '../widgets/Reminders/RemindersWidget'
```
```tsx
      <div className={styles.recap}>
        <RecapWidget />
      </div>
      <div className={styles.usage}>
        <UsageWidget />
      </div>
      <div className={styles.reminders}>
        <RemindersWidget />
      </div>
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/widgets`
Expected: all widget tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: yesterday recap, Claude usage stats, and reminders widgets"
```

---

### Task 12: Stock ticker bar (marquee)

**Files:**
- Create: `src/shell/TickerBar.tsx`, `src/shell/TickerBar.module.css`
- Modify: `src/App.tsx` (render `TickerBar` below the main flex row)
- Test: `src/shell/TickerBar.test.tsx`

**Interfaces:**
- Consumes: `provider.getStocks`, `useWidgetData`.
- Produces: `TickerBar` (no props).

- [ ] **Step 1: Write failing test**

`src/shell/TickerBar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { TickerBar } from './TickerBar'

it('renders each stock twice (duplicated marquee track) with signed change', async () => {
  render(<TickerBar />)
  expect((await screen.findAllByText('AAPL')).length).toBe(2)
  expect(screen.getAllByText('+1.2%')[0]).toBeInTheDocument()
  expect(screen.getAllByText('−2.1%')[0]).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/shell/TickerBar`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement ticker**

`src/shell/TickerBar.tsx`:
```tsx
import { useWidgetData } from '../components/useWidgetData'
import { provider } from '../data/providerFactory'
import type { StockQuote } from '../data/types'
import styles from './TickerBar.module.css'

function Item({ s }: { s: StockQuote }) {
  const up = s.changePct >= 0
  return (
    <span className={styles.item}>
      <span className={styles.symbol}>{s.symbol}</span>
      <span className={styles.price}>{s.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      <span className={up ? styles.up : styles.down}>
        {up ? '▲' : '▼'} {up ? '+' : '−'}
        {Math.abs(s.changePct).toFixed(1)}%
      </span>
    </span>
  )
}

export function TickerBar() {
  const { data } = useWidgetData(provider.getStocks)
  if (!data) return <div className={styles.ticker} aria-hidden="true" />
  return (
    <div className={styles.ticker} title="Holdings vs yesterday">
      <div className={styles.track}>
        {data.map((s) => (
          <Item key={s.symbol} s={s} />
        ))}
        {data.map((s) => (
          <Item key={`${s.symbol}-dup`} s={s} />
        ))}
      </div>
    </div>
  )
}
```

`src/shell/TickerBar.module.css`:
```css
.ticker {
  overflow: hidden;
  border-top: 1px solid var(--border);
  background: var(--bg-panel);
  min-height: 38px;
}

.track {
  display: inline-flex;
  gap: 36px;
  padding: 9px 18px;
  white-space: nowrap;
  width: max-content;
  animation: scroll 45s linear infinite;
}

.ticker:hover .track {
  animation-play-state: paused;
}

@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.item {
  display: inline-flex;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.symbol {
  font-weight: 600;
  color: var(--accent-cyan);
  text-shadow: var(--glow-cyan);
}

.price { color: var(--text-primary); }
.up { color: var(--accent-green); font-size: 12px; }
.down { color: var(--accent-rose); font-size: 12px; }
```

Modify `src/App.tsx`:
```tsx
import { Sidebar } from './shell/Sidebar'
import { TopBar } from './shell/TopBar'
import { DashboardGrid } from './shell/DashboardGrid'
import { TickerBar } from './shell/TickerBar'

export function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <DashboardGrid />
      </div>
      <TickerBar />
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/shell`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scrolling stock ticker with up/down deltas vs yesterday"
```

---

### Task 13: Compose bar (post automation placeholder)

**Files:**
- Create: `src/shell/ComposeBar.tsx`, `src/shell/ComposeBar.module.css`
- Modify: `src/App.tsx` (render `ComposeBar` below `TickerBar`)
- Test: `src/shell/ComposeBar.test.tsx`

**Interfaces:**
- Consumes: nothing from provider (static in v1; integration point documented in INTEGRATION.md).
- Produces: `ComposeBar` (no props).

- [ ] **Step 1: Write failing test**

`src/shell/ComposeBar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposeBar } from './ComposeBar'

it('toggles platform chips and keeps Post disabled in v1', async () => {
  render(<ComposeBar />)
  const linkedin = screen.getByRole('button', { name: 'LinkedIn' })
  expect(linkedin).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(linkedin)
  expect(linkedin).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: /post/i })).toBeDisabled()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/shell/ComposeBar`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement compose bar**

`src/shell/ComposeBar.tsx`:
```tsx
import { useState } from 'react'
import styles from './ComposeBar.module.css'

const PLATFORMS = ['LinkedIn', 'X', 'Substack', 'Newsletter'] as const

export function ComposeBar() {
  const [active, setActive] = useState<Set<string>>(new Set(PLATFORMS))
  const [text, setText] = useState('')

  const toggle = (p: string) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  return (
    <div className={styles.compose}>
      <textarea
        className={styles.input}
        rows={1}
        placeholder="Write once, post everywhere…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={styles.chips}>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            className={active.has(p) ? styles.chipActive : styles.chip}
            aria-pressed={active.has(p)}
            onClick={() => toggle(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <button className={styles.post} disabled title="Connects when backend lands">
        Post
      </button>
    </div>
  )
}
```

`src/shell/ComposeBar.module.css`:
```css
.compose {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-top: 1px solid var(--border);
}

.input {
  flex: 1;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font: inherit;
  padding: 8px 12px;
  resize: none;
}

.input:focus {
  outline: none;
  border-color: var(--accent-violet);
}

.chips {
  display: flex;
  gap: 6px;
}

.chip,
.chipActive {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.chipActive {
  color: var(--accent-violet);
  border-color: var(--accent-violet);
  background: var(--bg-raised);
}

.post {
  padding: 7px 18px;
  border-radius: 8px;
  background: var(--bg-raised);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.post:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 767px) {
  .compose { flex-wrap: wrap; margin-bottom: 60px; }
}
```

Modify `src/App.tsx` — add import and render below `<TickerBar />`:
```tsx
import { ComposeBar } from './shell/ComposeBar'
```
```tsx
      <TickerBar />
      <ComposeBar />
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/shell/ComposeBar`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: compose-once post bar with platform toggles (post disabled until backend)"
```

---

### Task 14: Full verification — tests, typecheck, build

**Files:**
- Modify: only if failures are found.

- [ ] **Step 1: Run the entire test suite**

Run: `npm test`
Expected: all test files pass (data, components, shell, all widgets, App). Fix any failures before proceeding.

- [ ] **Step 2: Typecheck and production build**

Run: `npm run build`
Expected: `tsc` clean (strict, noUnusedLocals), vite build succeeds.

- [ ] **Step 3: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix: green test suite and clean production build"
```

---

### Task 15: Documentation — README, DESIGN, ARCHITECTURE, INTEGRATION

**Files:**
- Create: `README.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/INTEGRATION.md`

**Interfaces:**
- Consumes: everything built. INTEGRATION.md's provider-method names must match `src/data/DataProvider.ts` exactly.

- [ ] **Step 1: Write README.md**

```markdown
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
```

- [ ] **Step 2: Write docs/DESIGN.md**

```markdown
# Design System — "Polar Night Glow"

Aesthetic: northern lights over dark arctic ice. Deep layered blue-blacks
with sparing aurora glow accents. Minimal, editorial, calm — light appears
only where information is alive.

## Palette (tokens in `src/styles/tokens.css`)

| Token | Hex | Role |
|---|---|---|
| `--bg-base` | `#070B12` | Page background — polar night, never pure black |
| `--bg-panel` | `#0D1420` | Widget panels |
| `--bg-raised` | `#121B2B` | Hover surfaces, chips |
| `--border` | `#1A2432` | 1px borders, dividers |
| `--text-primary` | `#E6EDF7` | Primary content |
| `--text-secondary` | `#8B98AC` | Meta, labels, timestamps |
| `--accent-cyan` | `#67E8F9` | Live elements: clock, ticker symbols, active nav |
| `--accent-green` | `#6EE7B7` | Positive: stocks up, done todos, quote accent |
| `--accent-violet` | `#A78BFA` | Social/creative: tweets, LinkedIn, compose |
| `--accent-rose` | `#FDA4AF` | Urgent/negative: stocks down, unread important mail |

### Color theory rationale

An analogous cool-hue family (cyan → green → violet) over a cool dark base
gives harmony without monotony. Rose is the single warm complement,
reserved exclusively for urgency — because it is the only warm hue on the
page, it always reads as "attention" without shouting. Accents run at low
volume (dots, deltas, glows, 2px indicators); surfaces stay neutral.

**Rule: color identifies (source, direction, urgency) — it never decorates.**

Color-coding systems: calendar sources and mailboxes each map to an accent
hue dot; the hue is the identity of the source across the whole page.

## Typography

- UI: Instrument Sans; tabular numerals for clock, stocks, and stats.
- Display: Newsreader light (serif, italic) — the daily quote only. The
  serif-against-dark quote is the page's signature "classy" element.
- Small uppercase labels with 0.1em+ letter-spacing for panel titles.

## Glow & motion rules

- Cyan text-glow on the live clock and ticker symbols only.
- Panels lift with a subtle border-color shift on hover — no shadows.
- Widgets stagger-fade upward on load (~0.5s, 60ms steps).
- Ticker: infinite right-to-left marquee (duplicated track), pauses on hover.
- Everything honors `prefers-reduced-motion: reduce`.

## Layout

Desktop: 4-column CSS grid (calendar column slightly wider), sidebar icon
rail left, ticker + compose bars pinned at the bottom of the document flow.
Tablet: 2 columns. Mobile: 1 column; the sidebar becomes a fixed bottom bar.
Widget bodies scroll internally; the page never scrolls horizontally.
```

- [ ] **Step 3: Write docs/ARCHITECTURE.md**

```markdown
# Architecture

React 18 + Vite + TypeScript (strict). No UI framework. CSS Modules +
design tokens.

## Structure

    src/
      data/            # types, DataProvider interface, MockDataProvider, factory
      components/      # useWidgetData hook, Panel + WidgetBody chrome
      shell/           # TopBar, Sidebar, DashboardGrid, TickerBar, ComposeBar
      widgets/<Name>/  # one folder per widget: component + styles + test
      styles/          # tokens.css (design system), global.css

## The data layer (read this before building the backend)

- `src/data/types.ts` — every data shape the UI consumes.
- `src/data/DataProvider.ts` — the contract: one async method per widget.
- `src/data/MockDataProvider.ts` — v1 implementation; realistic data,
  simulated latency, dates computed relative to "today".
- `src/data/providerFactory.ts` — **the swap point.** Exports the singleton
  `provider`. Backend day: implement `ApiDataProvider implements
  DataProvider` and construct it here instead. No widget changes.

Provider methods are arrow-function class properties so they are bound and
referentially stable — widgets pass them straight to `useWidgetData`.

## Widget lifecycle

Every widget follows the same pattern:

    const state = useWidgetData(provider.getX)
    return (
      <Panel title="…" accent="…" id="…">
        <WidgetBody {...state} isEmpty={…}>{(data) => …}</WidgetBody>
      </Panel>
    )

`useWidgetData` provides `{ data, loading, error, retry }`. `WidgetBody`
renders skeleton / error+Retry / empty states uniformly, so a failing API
degrades one widget gracefully — never the page.

## Adding a widget

1. Add the data type to `types.ts`, a method to `DataProvider`, mock data
   to `MockDataProvider`.
2. Create `src/widgets/<Name>/` with component + module.css + test.
3. Add a grid area in `DashboardGrid.module.css` (all three breakpoints)
   and render the widget in `DashboardGrid.tsx`.

## Testing

- Contract tests: `MockDataProvider.test.ts` verifies every method resolves
  with valid, cross-referenced data.
- Widget tests: data rendering + error state (spy on the provider method
  with `vi.spyOn(provider, 'getX').mockRejectedValueOnce(...)`).
- Behavior tests: clock ticking (fake timers), tab switching, todo
  toggling, clipboard copy, marquee duplication.
```

- [ ] **Step 4: Write docs/INTEGRATION.md**

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add README.md docs
git commit -m "docs: README, design system, architecture, and backend integration guide"
```

---

### Task 16: Browser QA pass

**Files:**
- Modify: only if bugs are found (fix + note in commit).

- [ ] **Step 1: Build and serve production bundle**

Run: `npm run build && npm run preview &` — serves at http://localhost:4173.

- [ ] **Step 2: QA checklist in browser** (use the browse tool / headless browser)

- Desktop 1440×900 screenshot: full grid visible, matches wireframe areas, quote serif renders, clock glows and ticks.
- Tablet 900×800 screenshot: 2-column layout, nothing overflows.
- Mobile 390×844 screenshot: single column, sidebar is a fixed bottom bar, compose bar clears it.
- Ticker scrolls right-to-left continuously and pauses on hover.
- No horizontal page scroll at any width.
- Zero console errors.
- Tab through interactive elements (sidebar buttons, tabs, todos, chips) — all focusable and operable.

- [ ] **Step 3: Fix anything found, re-verify, commit**

```bash
git add -A
git commit -m "fix: QA polish from browser pass"
```

---

## Self-Review (performed at plan-writing time)

- **Spec coverage:** all 13 spec widgets map to Tasks 4–13; states/errors → Task 3; tokens/motion/responsive → Tasks 1, 4, and per-widget CSS; testing → per-task TDD + Task 14 + Task 16; docs → Task 15. Suggested-reply copy, ticker pause-on-hover, reduced-motion, empty-state copy all covered.
- **Placeholder scan:** none — every step has complete code or exact commands.
- **Type consistency:** provider method names in widgets match `DataProvider.ts`; `AccentColor` shared from `types.ts`; `WidgetBody` prop spread matches `useWidgetData` return shape.
