import type { DataProvider } from './DataProvider'
import { MockDataProvider } from './MockDataProvider'
import type { CalendarEvent, CalendarSource } from './types'

interface CalendarResponse {
  sources: CalendarSource[]
  events: CalendarEvent[]
}

/**
 * Hybrid provider: calendar from the backend API, everything else from mock
 * until each subsystem ships. Keeps the dashboard usable while we integrate
 * one source at a time.
 */
export class ApiDataProvider implements DataProvider {
  private readonly fallback: MockDataProvider

  getCalendar: DataProvider['getCalendar']
  getQuote: DataProvider['getQuote']
  getEmails: DataProvider['getEmails']
  getNews: DataProvider['getNews']
  getRepoTrends: DataProvider['getRepoTrends']
  getTweets: DataProvider['getTweets']
  getLinkedIn: DataProvider['getLinkedIn']
  getTodos: DataProvider['getTodos']
  getYesterdayRecap: DataProvider['getYesterdayRecap']
  getUsageStats: DataProvider['getUsageStats']
  getReminders: DataProvider['getReminders']
  getStocks: DataProvider['getStocks']
  getDevices: DataProvider['getDevices']
  getRenewals: DataProvider['getRenewals']
  getFinance: DataProvider['getFinance']

  constructor(
    private readonly apiBase: string,
    fallbackOpts: { latencyMs?: number } = {},
  ) {
    this.fallback = new MockDataProvider(fallbackOpts)

    this.getCalendar = async (): Promise<CalendarResponse> => {
      const res = await fetch(`${this.apiBase}/api/calendar`)
      if (!res.ok) {
        const body = await safeJson(res)
        const message =
          typeof body?.message === 'string'
            ? body.message
            : `Calendar request failed (${res.status})`
        throw new Error(message)
      }
      return res.json() as Promise<CalendarResponse>
    }

    this.getQuote = this.fallback.getQuote
    this.getEmails = this.fallback.getEmails
    this.getNews = this.fallback.getNews
    this.getRepoTrends = this.fallback.getRepoTrends
    this.getTweets = this.fallback.getTweets
    this.getLinkedIn = this.fallback.getLinkedIn
    this.getTodos = this.fallback.getTodos
    this.getYesterdayRecap = this.fallback.getYesterdayRecap
    this.getUsageStats = this.fallback.getUsageStats
    this.getReminders = this.fallback.getReminders
    this.getStocks = this.fallback.getStocks
    this.getDevices = this.fallback.getDevices
    this.getRenewals = this.fallback.getRenewals
    this.getFinance = this.fallback.getFinance
  }
}

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>
  } catch {
    return null
  }
}
