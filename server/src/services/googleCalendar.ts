import { google } from 'googleapis'
import type { ServerConfig } from '../config'
import { accountIdFromSub, colorForEmail } from '../lib/colors'
import { todayWindow } from '../lib/dates'
import { AppError } from '../lib/errors'
import type {
  CalendarEvent,
  CalendarResponse,
  CalendarSource,
  StoredAccount,
  StoredGoogleTokens,
} from '../types/calendar'
import { TokenStore } from './tokenStore'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
]

export class GoogleCalendarService {
  private readonly tokenStore: TokenStore

  constructor(private readonly config: ServerConfig) {
    this.tokenStore = new TokenStore(config.dataDir)
  }

  getAuthUrl(): string {
    return this.oauthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
    })
  }

  async handleCallback(code: string): Promise<StoredAccount> {
    const client = this.oauthClient()
    const { tokens } = await client.getToken(code)
    client.setCredentials(asGoogleCredentials(tokens))

    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: profile } = await oauth2.userinfo.get()
    if (!profile.email || !profile.id) {
      throw new AppError('Google profile missing email or id', 502, 'google_profile')
    }

    const account: StoredAccount = {
      id: accountIdFromSub(profile.id),
      email: profile.email,
      sub: profile.id,
      color: colorForEmail(profile.email),
      tokens,
      connectedAt: new Date().toISOString(),
    }

    const existing = await this.tokenStore.getAccount(account.id)
    if (existing?.tokens.refresh_token && !tokens.refresh_token) {
      account.tokens.refresh_token = existing.tokens.refresh_token
    }

    await this.tokenStore.upsertAccount(account)
    return account
  }

  async listConnectedAccounts(): Promise<StoredAccount[]> {
    return this.tokenStore.listAccounts()
  }

  async getMergedCalendar(): Promise<CalendarResponse> {
    const accounts = await this.tokenStore.listAccounts()
    if (accounts.length === 0) {
      throw new AppError('No Google accounts connected', 401, 'not_connected', {
        authUrl: '/auth/google',
      })
    }

    const { timeMin, timeMax } = todayWindow(this.config.calendarTimezone)
    const sources: CalendarSource[] = accounts.map((a) => ({
      id: a.id,
      name: a.email,
      color: a.color,
    }))

    const eventGroups = await Promise.all(
      accounts.map((account) => this.fetchAccountEvents(account, timeMin, timeMax)),
    )

    const events = eventGroups.flat().sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    return { sources, events }
  }

  private async fetchAccountEvents(
    account: StoredAccount,
    timeMin: string,
    timeMax: string,
  ): Promise<CalendarEvent[]> {
    const auth = await this.authorizedClient(account)
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

  private async authorizedClient(account: StoredAccount) {
    const client = this.oauthClient()
    client.setCredentials(asGoogleCredentials(account.tokens))
    const fresh = await this.ensureFreshTokens(client, account)
    client.setCredentials(asGoogleCredentials(fresh))
    return client
  }

  private async ensureFreshTokens(
    client: ReturnType<typeof this.oauthClient>,
    account: StoredAccount,
  ): Promise<StoredGoogleTokens> {
    const expiry = account.tokens.expiry_date ?? 0
    const needsRefresh = !account.tokens.access_token || Date.now() >= expiry - 60_000

    if (!needsRefresh) return account.tokens
    if (!account.tokens.refresh_token) {
      throw new AppError(`Reconnect required for ${account.email}`, 401, 'token_expired', {
        authUrl: '/auth/google',
      })
    }

    const { credentials } = await client.refreshAccessToken()
    const merged = { ...account.tokens, ...credentials }
    await this.tokenStore.updateTokens(account.id, merged)
    return merged
  }

  private oauthClient() {
    return new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.redirectUri,
    )
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

/** Strip nulls so googleapis Credentials type is satisfied. */
function asGoogleCredentials(tokens: StoredGoogleTokens) {
  return {
    access_token: tokens.access_token ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
    token_type: tokens.token_type ?? undefined,
    scope: tokens.scope,
  }
}
