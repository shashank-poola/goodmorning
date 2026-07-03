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
