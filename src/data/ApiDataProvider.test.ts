import { ApiDataProvider } from './ApiDataProvider'

afterEach(() => {
  vi.restoreAllMocks()
})

it('getCalendar fetches from the API and returns parsed JSON', async () => {
  const payload = {
    sources: [{ id: 'google-1', name: 'work@gmail.com', color: 'gold' as const }],
    events: [
      {
        id: 'google-1:e1',
        sourceId: 'google-1',
        title: 'Standup',
        start: '2026-07-07T09:30:00.000Z',
        end: '2026-07-07T09:45:00.000Z',
      },
    ],
  }

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }),
  )

  const provider = new ApiDataProvider('http://localhost:3001', { latencyMs: 0 })
  await expect(provider.getCalendar()).resolves.toEqual(payload)
  expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/calendar')
})

it('getCalendar throws with the API error message on failure', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'No Google accounts connected' }),
    }),
  )

  const provider = new ApiDataProvider('', { latencyMs: 0 })
  await expect(provider.getCalendar()).rejects.toThrow('No Google accounts connected')
})

it('getEmails fetches from the API and returns parsed JSON', async () => {
  const payload = {
    mailboxes: [{ id: 'google-1', name: 'work@gmail.com', color: 'gold' as const }],
    emails: [
      {
        id: 'google-1:abc',
        mailboxId: 'google-1',
        sender: 'Ana Duarte',
        subject: 'Q3 roadmap',
        preview: 'Before our 1:1…',
        receivedAt: '2026-07-07T07:12:00.000Z',
        unread: true,
      },
    ],
  }

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }),
  )

  const provider = new ApiDataProvider('http://localhost:3001', { latencyMs: 0 })
  await expect(provider.getEmails()).resolves.toEqual(payload)
  expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/emails')
})

it('getNews fetches from the API', async () => {
  const payload = [
    {
      id: 'n1',
      category: 'tech' as const,
      headline: 'Test',
      source: 'The Verge',
      publishedAt: '2026-07-07T06:40:00.000Z',
      url: 'https://example.com',
    },
  ]

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => payload }),
  )

  const provider = new ApiDataProvider('', { latencyMs: 0 })
  await expect(provider.getNews()).resolves.toEqual(payload)
  expect(fetch).toHaveBeenCalledWith('/api/news')
})

it('delegates getQuote to the mock fallback', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sources: [], events: [] }),
    }),
  )

  const provider = new ApiDataProvider('', { latencyMs: 0 })
  const quote = await provider.getQuote()
  expect(quote.author).toBe('Mark Twain')
})
