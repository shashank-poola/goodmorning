import { Hono } from 'hono'
import { NEWS_FEEDS } from './data/newsFeeds'
import type { ServerConfig } from './config'
import { isAppError } from './lib/errors'
import { GlmClient } from './services/glmClient'
import { IntelligenceService } from './services/intelligenceService'
import { GitHubTrendingService } from './services/githubTrending'
import { GoogleAccountsService } from './services/googleAccounts'
import { GoogleCalendarService } from './services/googleCalendar'
import { GoogleGmailService } from './services/googleGmail'
import { RssNewsService } from './services/rssNews'
import { TodoService } from './services/todoService'
import { TodoStore } from './services/todoStore'
import { TweetRssService } from './services/tweetRss'
import type { AuthStatusResponse, AuthStatusUser, StoredAccount } from './types/calendar'
import type { CreateTodoBody, UpdateTodoBody } from './types/todo'

export function createApp(config: ServerConfig) {
  const app = new Hono()
  const accounts = new GoogleAccountsService(config)
  const calendarService = new GoogleCalendarService(accounts, config)
  const gmailService = new GoogleGmailService(accounts)
  const newsService = new RssNewsService()
  const githubService = new GitHubTrendingService()
  const todoService = new TodoService(new TodoStore(config.dataDir))
  const tweetService = new TweetRssService()
  const intelligence = new IntelligenceService(new GlmClient(config.zaiApiKey, config.zaiModel))

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
      const important = data.emails.filter((e) => e.important && e.unread).slice(0, 4)
      await Promise.all(
        important.map(async (email) => {
          email.whyItMatters = await intelligence.whyEmailMatters({
            sender: email.sender,
            subject: email.subject,
            preview: email.preview,
          })
        }),
      )
      return c.json(data)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/news', async (c) => {
    try {
      const items = await newsService.getNews(NEWS_FEEDS)
      // Generate insights for all items (spec §4.4: cheap GLM for extraction)
      await Promise.all(
        items.map(async (item) => {
          item.insight = await intelligence.newsInsight({
            headline: item.headline,
            source: item.source,
          })
        }),
      )
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

  app.get('/api/tweets', async (c) => {
    try {
      const tweets = await tweetService.getTweets()
      // Add per-tweet insights for top 5 (spec §4.5 model-tiering: cheap GLM for extraction)
      await Promise.all(
        tweets.slice(0, 5).map(async (tweet) => {
          tweet.insight = await intelligence.tweetInsight(tweet)
        }),
      )
      return c.json(tweets)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/yesterday-recap', async (c) => {
    try {
      const bullets = await intelligence.yesterdayRecap(await buildRecapContext())
      return c.json({ bullets })
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/linkedin', async (c) => {
    try {
      const body = await buildLinkedInPayload(intelligence)
      return c.json(body)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.post('/api/linkedin/paste', async (c) => {
    try {
      const body = (await c.req.json()) as { text?: string }
      const drafts = await intelligence.linkedInPasteReplies(body.text ?? '')
      return c.json({ drafts })
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.get('/api/todos', async (c) => {
    try {
      return c.json(await todoService.list())
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.post('/api/todos', async (c) => {
    try {
      const body = (await c.req.json()) as CreateTodoBody
      const text = body.text?.trim() ?? ''

      // Duplicate detection (spec §4.3)
      const existing = await todoService.list()
      const duplicate = await intelligence.findDuplicate(text, existing.map((t) => t.text))
      if (duplicate) {
        return c.json(
          { error: 'duplicate', message: `Already have a similar task: "${duplicate}"` },
          409,
        )
      }

      // Auto-categorisation (spec §4.3)
      const priority = body.priority ?? (await intelligence.categorizeTodo(text))
      const todo = await todoService.create({ ...body, priority })
      return c.json(todo, 201)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.patch('/api/todos/:id', async (c) => {
    try {
      const body = (await c.req.json()) as UpdateTodoBody
      const todo = await todoService.update(c.req.param('id'), body)
      return c.json(todo)
    } catch (error) {
      return errorResponse(c, error)
    }
  })

  app.delete('/api/todos/:id', async (c) => {
    try {
      await todoService.remove(c.req.param('id'))
      return c.body(null, 204)
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

  async function buildRecapContext(): Promise<string> {
    const lines: string[] = ['Yesterday activity summary:']

    try {
      const cal = await calendarService.getMergedCalendar()
      lines.push(`${cal.events.length} calendar events`)
    } catch {
      lines.push('Calendar not connected')
    }

    try {
      const mail = await gmailService.getMergedEmails()
      const unread = mail.emails.filter((e) => e.unread).length
      lines.push(`${mail.emails.length} emails (${unread} unread)`)
    } catch {
      lines.push('Email not connected')
    }

    const todos = await todoService.list()
    lines.push(`${todos.filter((t) => t.done).length} todos done, ${todos.filter((t) => !t.done).length} open`)

    return lines.join('\n')
  }

  return app
}

async function buildLinkedInPayload(intelligence: IntelligenceService) {
  const now = new Date().toISOString()
  const seed = [
    {
      id: 'l1',
      from: 'Riya Kapoor',
      preview: 'Loved your post on dashboards — would you be open to a chat?',
      receivedAt: now,
    },
    {
      id: 'l2',
      from: 'Daniel Chen',
      preview: 'We are hiring a founding engineer, your profile stood out…',
      receivedAt: now,
    },
  ]

  const messages = await Promise.all(
    seed.map(async (m) => ({
      ...m,
      suggestedReply: await intelligence.linkedInReply({ from: m.from, preview: m.preview }),
    })),
  )

  return {
    stats: {
      followersTotal: 4382,
      followersGainedYesterday: 27,
      post: {
        title: 'Why I built my own morning dashboard',
        impressions: 12480,
        reactions: 214,
        comments: 31,
      },
    },
    messages,
  }
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
