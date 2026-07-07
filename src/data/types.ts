export type AccentColor = 'gold' | 'sage' | 'blue' | 'clay'

export type ComposeTarget = 'LinkedIn' | 'X' | 'Substack' | 'Newsletter'

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
  /** Gmail IMPORTANT label — used by the Important Emails widget. */
  important?: boolean
  /** LLM-generated one-liner — why this needs attention. */
  whyItMatters?: string
}

export interface NewsItem {
  id: string
  category: 'tech' | 'world'
  headline: string
  source: string
  publishedAt: string // ISO datetime
  url: string
  /** LLM one-liner — why this headline matters. */
  insight?: string
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

export type DeviceKind =
  | 'earbuds'
  | 'headphones'
  | 'watch'
  | 'mouse'
  | 'keyboard'
  | 'speaker'
  | 'phone'

export interface BluetoothDevice {
  id: string
  name: string
  kind: DeviceKind
  batteryPct: number // 0–100
  connected: boolean
}

// ---- Finance & renewals ----

/** Who an expense/renewal belongs to. Company = business liability. */
export type Entity = 'personal' | 'company'

export type Cadence = 'weekly' | 'monthly' | 'yearly'

export type ExpenseCategory =
  | 'software'
  | 'subscription'
  | 'insurance'
  | 'domain'
  | 'vehicle'
  | 'tax'
  | 'utilities'
  | 'office'
  | 'health'
  | 'travel'
  | 'other'

/** A funding source — "which account was it paid from". */
export interface Account {
  id: string
  name: string // "Amex Business", "HSBC Personal"
  entity: Entity
  last4?: string
  color: AccentColor
}

/** A commitment that repeats on a cadence (subscriptions, insurance, memberships). */
export interface RecurringExpense {
  id: string
  name: string
  amount: number
  cadence: Cadence
  nextChargeDate: string // ISO date
  accountId: string
  entity: Entity
  category: ExpenseCategory
}

/** A single, one-off transaction. */
export interface Expense {
  id: string
  description: string
  amount: number
  date: string // ISO date
  accountId: string
  entity: Entity
  category: ExpenseCategory
}

export type RenewalKind =
  | 'domain'
  | 'mot'
  | 'insurance'
  | 'subscription'
  | 'tax'
  | 'license'
  | 'other'

/** A time-sensitive thing to renew/act on — surfaced on the dashboard. */
export interface Renewal {
  id: string
  label: string
  kind: RenewalKind
  dueDate: string // ISO date
  entity: Entity
  amount?: number
  accountId?: string
}

/** Bundle returned by the Finance section's single fetch. */
export interface FinanceData {
  accounts: Account[]
  recurring: RecurringExpense[]
  expenses: Expense[]
}
