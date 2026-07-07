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
