import { google } from 'googleapis'
import type { ServerConfig } from '../config'
import { todayWindow } from '../lib/dates'
import { AppError } from '../lib/errors'
import type {
  CalendarEvent,
  CalendarResponse,
  CalendarSource,
  StoredAccount,
} from '../types/calendar'
import type { GoogleAccountsService } from './googleAccounts'

export class GoogleCalendarService {
  constructor(
    private readonly accounts: GoogleAccountsService,
    private readonly config: ServerConfig,
  ) {}

  async getMergedCalendar(): Promise<CalendarResponse> {
    const accountList = await this.accounts.requireAccounts()
    const { timeMin, timeMax } = todayWindow(this.config.calendarTimezone)

    const sources: CalendarSource[] = accountList.map((a) => ({
      id: a.id,
      name: a.email,
      color: a.color,
    }))

    const eventGroups = await Promise.all(
      accountList.map((account) => this.fetchAccountEvents(account, timeMin, timeMax)),
    )

    const events = eventGroups.flat().sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    return { sources, events }
  }

  private async fetchAccountEvents(
    account: StoredAccount,
    timeMin: string,
    timeMax: string,
  ): Promise<CalendarEvent[]> {
    const auth = await this.accounts.getAuthorizedClient(account)
    const calendar = google.calendar({ version: 'v3', auth })

    try {
      const { data } = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      })

      return (data.items ?? [])
        .filter((item) => item.id && item.summary)
        .map((item) => mapGoogleEvent(account.id, item))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google Calendar API error'
      throw new AppError(message, 502, 'google_calendar', { account: account.email })
    }
  }
}

type GoogleEvent = {
  id?: string | null
  summary?: string | null
  location?: string | null
  hangoutLink?: string | null
  start?: { dateTime?: string | null; date?: string | null }
  end?: { dateTime?: string | null; date?: string | null }
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }> | null
  } | null
}

function mapGoogleEvent(sourceId: string, item: GoogleEvent): CalendarEvent {
  const start = item.start?.dateTime ?? allDayStart(item.start?.date)
  const end = item.end?.dateTime ?? allDayEnd(item.end?.date)
  const meetLink = item.hangoutLink ?? videoEntry(item.conferenceData)

  return {
    id: `${sourceId}:${item.id}`,
    sourceId,
    title: item.summary ?? 'Untitled',
    start,
    end,
    location: item.location ?? undefined,
    meetLink: meetLink ?? undefined,
  }
}

function allDayStart(date?: string | null): string {
  if (!date) return new Date().toISOString()
  return `${date}T00:00:00.000Z`
}

function allDayEnd(date?: string | null): string {
  if (!date) return new Date().toISOString()
  return `${date}T23:59:59.000Z`
}

function videoEntry(
  conference?: GoogleEvent['conferenceData'],
): string | undefined {
  const video = conference?.entryPoints?.find((e) => e.entryPointType === 'video')
  return video?.uri ?? undefined
}
