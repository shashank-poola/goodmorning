import { Hono } from 'hono'
import { NEWS_FEEDS } from './data/newsFeeds'
import type { ServerConfig } from './config'
import { isAppError } from './lib/errors'
import { GitHubTrendingService } from './services/githubTrending'
import { GoogleAccountsService } from './services/googleAccounts'
import { GoogleCalendarService } from './services/googleCalendar'
import { GoogleGmailService } from './services/googleGmail'
import { RssNewsService } from './services/rssNews'
import type { AuthStatusResponse, AuthStatusUser, StoredAccount } from './types/calendar'

export function createApp(config: ServerConfig) {
  const app = new Hono()
  const accounts = new GoogleAccountsService(config)
  const calendarService = new GoogleCalendarService(accounts, config)
  const gmailService = new GoogleGmailService(accounts)
  const newsService = new RssNewsService()
  const githubService = new GitHubTrendingService()

  app.get('/api/health', (c) =>
    c.json({ ok: true, service: 'goodmorning-server' }),
  )

  app.get('/api/auth/status', async (c) => {
    const accountList = await accounts.listAccounts()
    const body: AuthStatusResponse = {
      connected: accountList.length > 0,
      user: primaryUser(accountList),
      accounts: accountList.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        color: a.color,
      })),
    }
    return c.json(body)
  })

  app.get('/api/calendar', async (c) => {
    try {
      const data = await calendarService.getMergedCalendar()
      return c.json(data)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/emails', async (c) => {
    try {
      const data = await gmailService.getMergedEmails()
      return c.json(data)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/news', async (c) => {
    try {
      const items = await newsService.getNews(NEWS_FEEDS)
      return c.json(items)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/repos', async (c) => {
    try {
      const repos = await githubService.getTrending()
      return c.json(repos)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/auth/google', (c) => c.redirect(accounts.getAuthUrl()))

  app.get('/auth/google/callback', async (c) => {
    const code = c.req.query('code')
    if (!code) {
      return c.redirect(`${config.frontendUrl}?auth=failed`)
    }

    try {
      await accounts.handleCallback(code)
      return c.redirect(`${config.frontendUrl}?auth=connected`)
    } catch {
      return c.redirect(`${config.frontendUrl}?auth=failed`)
    }
  })

  return app
}

function primaryUser(accounts: StoredAccount[]): AuthStatusUser | null {
  if (accounts.length === 0) return null
  const sorted = [...accounts].sort(
    (a, b) => Date.parse(b.connectedAt) - Date.parse(a.connectedAt),
  )
  const primary = sorted[0]!
  const name = primary.name || primary.email
  return {
    name,
    email: primary.email,
    initial: name.charAt(0).toUpperCase(),
  }
}

function errorResponse(c: import('hono').Context, error: unknown) {
  if (isAppError(error)) {
    return c.json(
      {
        error: error.code ?? 'error',
        message: error.message,
        ...error.details,
      },
      error.status,
    )
  }

  const message = error instanceof Error ? error.message : 'Internal server error'
  return c.json({ error: 'internal', message }, 500)
}
