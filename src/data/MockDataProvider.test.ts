import { MockDataProvider } from './MockDataProvider'

describe('MockDataProvider contract', () => {
  const p = new MockDataProvider({ latencyMs: 0 })

  it('resolves quote with text and author', async () => {
    const q = await p.getQuote()
    expect(q.text.length).toBeGreaterThan(0)
    expect(q.author.length).toBeGreaterThan(0)
  })

  it('resolves calendar with sources and events referencing valid sources', async () => {
    const { sources, events } = await p.getCalendar()
    expect(sources.length).toBeGreaterThan(1)
    expect(events.length).toBeGreaterThan(2)
    const ids = new Set(sources.map((s) => s.id))
    for (const e of events) expect(ids.has(e.sourceId)).toBe(true)
  })

  it('resolves emails grouped into valid mailboxes', async () => {
    const { mailboxes, emails } = await p.getEmails()
    const ids = new Set(mailboxes.map((m) => m.id))
    expect(emails.length).toBeGreaterThan(2)
    for (const e of emails) expect(ids.has(e.mailboxId)).toBe(true)
  })

  it('resolves news, repos, tweets, linkedin, todos, recap, usage, reminders, stocks', async () => {
    expect((await p.getNews()).length).toBeGreaterThan(3)
    expect((await p.getRepoTrends()).length).toBeGreaterThan(2)
    expect((await p.getTweets()).length).toBeGreaterThan(2)
    const li = await p.getLinkedIn()
    expect(li.stats.followersGainedYesterday).toBeGreaterThan(0)
    expect(li.messages.length).toBeGreaterThan(1)
    expect((await p.getTodos()).length).toBeGreaterThan(2)
    expect((await p.getYesterdayRecap()).bullets.length).toBeGreaterThan(2)
    const u = await p.getUsageStats()
    expect(u.yesterday.tokens).toBeGreaterThan(0)
    expect((await p.getReminders()).length).toBeGreaterThan(1)
    expect((await p.getStocks()).length).toBeGreaterThanOrEqual(8)
  })

  it('calendar events fall on today', async () => {
    const { events } = await p.getCalendar()
    const today = new Date().toDateString()
    for (const e of events) expect(new Date(e.start).toDateString()).toBe(today)
  })
})
