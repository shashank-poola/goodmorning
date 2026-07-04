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
