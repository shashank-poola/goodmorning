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
