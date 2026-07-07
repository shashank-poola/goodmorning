import { Hono } from 'hono'
import type { ServerConfig } from './config'
import { isAppError } from './lib/errors'
import { GoogleCalendarService } from './services/googleCalendar'

export function createApp(config: ServerConfig) {
  const app = new Hono()
  const calendarService = new GoogleCalendarService(config)

  app.get('/api/health', (c) =>
    c.json({ ok: true, service: 'goodmorning-server' }),
  )

  app.get('/api/auth/status', async (c) => {
    const accounts = await calendarService.listConnectedAccounts()
    return c.json({
      connected: accounts.length > 0,
      accounts: accounts.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.email,
        color: a.color,
      })),
    })
  })

  app.get('/api/calendar', async (c) => {
    try {
      const data = await calendarService.getMergedCalendar()
      return c.json(data)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/auth/google', (c) => c.redirect(calendarService.getAuthUrl()))

  app.get('/auth/google/callback', async (c) => {
    const code = c.req.query('code')
    if (!code) {
      return c.redirect(`${config.frontendUrl}?auth=failed`)
    }

    try {
      await calendarService.handleCallback(code)
      return c.redirect(`${config.frontendUrl}?auth=connected`)
    } catch {
      return c.redirect(`${config.frontendUrl}?auth=failed`)
    }
  })

  return app
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
