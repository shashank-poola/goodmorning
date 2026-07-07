import type { DataProvider } from './DataProvider'
import { STOCK_WATCHLIST } from './stockWatchlist'
import { TWEET_FOLLOWS } from './tweetFollows'
import { NEWS_FOLLOWS } from './newsFollows'
import type {
  Account,
  BluetoothDevice,
  CalendarEvent,
  CalendarSource,
  Email,
  FinanceData,
  LinkedInData,
  Mailbox,
  NewsItem,
  Quote,
  Reminder,
  Renewal,
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
  { id: 'work', name: 'Work', color: 'gold' },
  { id: 'personal', name: 'Personal', color: 'sage' },
  { id: 'side', name: 'Side project', color: 'blue' },
]

const MAILBOXES: Mailbox[] = [
  { id: 'work', name: 'Work', color: 'gold' },
  { id: 'personal', name: 'Personal', color: 'sage' },
  { id: 'newsletters', name: 'Newsletters', color: 'blue' },
]

const ACCOUNTS: Account[] = [
  { id: 'amex-biz', name: 'Amex Business', entity: 'company', last4: '1005', color: 'gold' },
  { id: 'hsbc-biz', name: 'HSBC Business', entity: 'company', last4: '4417', color: 'blue' },
  { id: 'monzo', name: 'Monzo Personal', entity: 'personal', last4: '9920', color: 'sage' },
  { id: 'amex-personal', name: 'Amex Personal', entity: 'personal', last4: '3388', color: 'clay' },
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

  getNews = (): Promise<NewsItem[]> => {
    // Full story pool; only stories from a followed page (NEWS_FOLLOWS) surface.
    const pool: NewsItem[] = [
      { id: 'n1', category: 'tech', headline: 'Anthropic ships Claude 5 family with new Mythos tier', source: 'The Verge', publishedAt: todayAt(6, 40), url: 'https://example.com/n1' },
      { id: 'n2', category: 'tech', headline: 'Vite 6 RC lands with full ESM-only pipeline', source: 'InfoQ', publishedAt: todayAt(6, 10), url: 'https://example.com/n2' },
      { id: 'n3', category: 'tech', headline: 'EU passes landmark AI interoperability rules', source: 'Ars Technica', publishedAt: todayAt(5, 45), url: 'https://example.com/n3' },
      { id: 'n4', category: 'world', headline: 'Global markets rally as inflation cools', source: 'Reuters', publishedAt: todayAt(6, 55), url: 'https://example.com/n4' },
      { id: 'n5', category: 'world', headline: 'Monsoon arrives early across western India', source: 'BBC', publishedAt: todayAt(5, 20), url: 'https://example.com/n5' },
      { id: 'n6', category: 'tech', headline: 'Startup raises $40M to put agents in the browser', source: 'TechCrunch', publishedAt: todayAt(6, 25), url: 'https://example.com/n6' },
    ]
    // Order by the follow list; drop anything from an unfollowed page.
    return this.wait(NEWS_FOLLOWS.flatMap((page) => pool.filter((n) => n.source === page)))
  }

  getRepoTrends = (): Promise<RepoTrend[]> =>
    this.wait([
      { id: 'r1', name: 'anthropics/claude-code', description: 'Agentic coding in your terminal', language: 'TypeScript', starsToday: 842, url: 'https://github.com/anthropics/claude-code' },
      { id: 'r2', name: 'vitejs/vite', description: 'Next generation frontend tooling', language: 'TypeScript', starsToday: 311, url: 'https://github.com/vitejs/vite' },
      { id: 'r3', name: 'huggingface/transformers', description: 'State-of-the-art ML for everyone', language: 'Python', starsToday: 267, url: 'https://github.com/huggingface/transformers' },
    ])

  getTweets = (): Promise<Tweet[]> => {
    // Latest post per followed handle. Add handles in tweetFollows.ts.
    const latest: Record<string, Omit<Tweet, 'handle'>> = {
      '@paulg': { id: 't1', displayName: 'Paul Graham', text: 'The best founders are relentlessly resourceful.', likes: 4200, reposts: 610, postedAt: todayAt(6, 30) },
      '@AnthropicAI': { id: 't2', displayName: 'Anthropic', text: 'Fable 5 is now available to everyone. Here is what it can do →', likes: 9800, reposts: 2100, postedAt: todayAt(5, 50) },
      '@naval': { id: 't3', displayName: 'Naval', text: 'Earn with your mind, not your time.', likes: 15600, reposts: 3400, postedAt: todayAt(4, 20) },
      '@sama': { id: 't4', displayName: 'Sam Altman', text: 'The cost of intelligence keeps falling. Build accordingly.', likes: 12300, reposts: 1800, postedAt: todayAt(6, 5) },
      '@karpathy': { id: 't5', displayName: 'Andrej Karpathy', text: 'The most underrated skill in 2026 is reading code fast.', likes: 8700, reposts: 1400, postedAt: todayAt(5, 15) },
    }
    return this.wait(
      TWEET_FOLLOWS.map((handle) => {
        const post = latest[handle]
        return post
          ? { handle, ...post }
          : { id: `follow-${handle}`, handle, displayName: handle.replace(/^@/, ''), text: 'No recent posts.', likes: 0, reposts: 0, postedAt: todayAt(0, 0) }
      }),
    )
  }

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

  getStocks = (): Promise<StockQuote[]> => {
    const mockPrices: Record<string, { price: number; changePct: number }> = {
      'AAPL': { price: 232.14, changePct: 1.2 },
      'NVDA': { price: 141.9, changePct: 3.4 },
      'TSLA': { price: 249.51, changePct: -2.1 },
      'MSFT': { price: 468.32, changePct: 0.6 },
      'GOOG': { price: 192.77, changePct: -0.4 },
      'AMZN': { price: 219.4, changePct: 1.8 },
      'META': { price: 712.05, changePct: 0.9 },
      'TCS.NS': { price: 3421.5, changePct: -1.3 },
      'RELIANCE.NS': { price: 2987.2, changePct: 0.7 },
      'INFY.NS': { price: 1854.6, changePct: 2.2 },
    }
    const fallback = { price: 100.0, changePct: 0.0 }

    return this.wait(
      STOCK_WATCHLIST.map((symbol) => ({
        symbol,
        ...(mockPrices[symbol] ?? fallback),
      })),
    )
  }

  getDevices = (): Promise<BluetoothDevice[]> =>
    this.wait([
      { id: 'bt1', name: 'AirPods Pro', kind: 'earbuds', batteryPct: 82, connected: true },
      { id: 'bt2', name: 'Apple Watch', kind: 'watch', batteryPct: 64, connected: true },
      { id: 'bt3', name: 'MX Master 3S', kind: 'mouse', batteryPct: 47, connected: true },
      { id: 'bt4', name: 'Sony WH-1000XM5', kind: 'headphones', batteryPct: 18, connected: true },
      { id: 'bt5', name: 'Magic Keyboard', kind: 'keyboard', batteryPct: 91, connected: false },
    ])

  getRenewals = (): Promise<Renewal[]> =>
    this.wait([
      { id: 'rn1', label: 'copperkite.com domain', kind: 'domain', dueDate: daysFromNow(4), entity: 'company', amount: 12, accountId: 'amex-biz' },
      { id: 'rn2', label: 'Car MOT — MX21 ABC', kind: 'mot', dueDate: daysFromNow(12), entity: 'personal', amount: 54.85 },
      { id: 'rn3', label: 'Business liability insurance', kind: 'insurance', dueDate: daysFromNow(1), entity: 'company', amount: 480, accountId: 'hsbc-biz' },
      { id: 'rn4', label: 'Private health insurance', kind: 'insurance', dueDate: daysFromNow(23), entity: 'personal', amount: 68, accountId: 'monzo' },
      { id: 'rn5', label: 'VAT return', kind: 'tax', dueDate: daysFromNow(-1), entity: 'company' },
      { id: 'rn6', label: 'Adobe CC licence', kind: 'license', dueDate: daysFromNow(9), entity: 'company', amount: 51.98, accountId: 'amex-biz' },
    ])

  getFinance = (): Promise<FinanceData> =>
    this.wait({
      accounts: ACCOUNTS,
      recurring: [
        { id: 'rc1', name: 'AWS', amount: 214.3, cadence: 'monthly', nextChargeDate: daysFromNow(6), accountId: 'amex-biz', entity: 'company', category: 'software' },
        { id: 'rc2', name: 'GitHub Team', amount: 32, cadence: 'monthly', nextChargeDate: daysFromNow(14), accountId: 'amex-biz', entity: 'company', category: 'software' },
        { id: 'rc3', name: 'Google Workspace', amount: 43.2, cadence: 'monthly', nextChargeDate: daysFromNow(3), accountId: 'hsbc-biz', entity: 'company', category: 'software' },
        { id: 'rc4', name: 'Business liability insurance', amount: 480, cadence: 'yearly', nextChargeDate: daysFromNow(1), accountId: 'hsbc-biz', entity: 'company', category: 'insurance' },
        { id: 'rc5', name: 'Netflix', amount: 12.99, cadence: 'monthly', nextChargeDate: daysFromNow(8), accountId: 'monzo', entity: 'personal', category: 'subscription' },
        { id: 'rc6', name: 'Spotify', amount: 11.99, cadence: 'monthly', nextChargeDate: daysFromNow(19), accountId: 'monzo', entity: 'personal', category: 'subscription' },
        { id: 'rc7', name: 'Gym membership', amount: 42, cadence: 'monthly', nextChargeDate: daysFromNow(21), accountId: 'amex-personal', entity: 'personal', category: 'health' },
        { id: 'rc8', name: 'Private health insurance', amount: 68, cadence: 'monthly', nextChargeDate: daysFromNow(23), accountId: 'monzo', entity: 'personal', category: 'insurance' },
      ],
      expenses: [
        { id: 'ex1', description: 'Figma seats', amount: 45, date: daysFromNow(-1), accountId: 'amex-biz', entity: 'company', category: 'software' },
        { id: 'ex2', description: 'Client lunch — Shoreditch', amount: 88.4, date: daysFromNow(-2), accountId: 'hsbc-biz', entity: 'company', category: 'travel' },
        { id: 'ex3', description: 'Petrol — Shell', amount: 62.1, date: daysFromNow(-2), accountId: 'monzo', entity: 'personal', category: 'vehicle' },
        { id: 'ex4', description: 'Office chair', amount: 189, date: daysFromNow(-4), accountId: 'amex-biz', entity: 'company', category: 'office' },
        { id: 'ex5', description: 'Groceries — Waitrose', amount: 74.28, date: daysFromNow(-5), accountId: 'amex-personal', entity: 'personal', category: 'other' },
        { id: 'ex6', description: 'Train — London to Manchester', amount: 96.5, date: daysFromNow(-6), accountId: 'hsbc-biz', entity: 'company', category: 'travel' },
      ],
    })
}
