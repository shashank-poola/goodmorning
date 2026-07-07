import { TWEET_FOLLOWS } from '../data/tweetFollows'

export interface Tweet {
  id: string
  handle: string
  displayName: string
  text: string
  likes: number
  reposts: number
  postedAt: string
  /** LLM one-liner — what this tweet is about / why it matters. */
  insight?: string
}

interface RssSource {
  buildUrl: (username: string) => string
}

/**
 * Multiple RSS/Atom sources for X posts — tried in parallel, first success wins.
 * Nitter mirrors go offline frequently; RSSHub public instances are more reliable.
 * Spec §4.5: file-driven follow list → best available free-then-paid source.
 */
const RSS_SOURCES: RssSource[] = [
  // RSSHub public instances (aggregator, more stable than individual Nitter mirrors)
  { buildUrl: (u) => `https://rsshub.app/twitter/user/${u}` },
  { buildUrl: (u) => `https://rsshub.rss.plus/twitter/user/${u}` },
  { buildUrl: (u) => `https://rsshub.fly.dev/twitter/user/${u}` },
  // Nitter mirrors (original RSS path format)
  { buildUrl: (u) => `https://nitter.poast.org/${u}/rss` },
  { buildUrl: (u) => `https://nitter.privacydev.net/${u}/rss` },
  { buildUrl: (u) => `https://nitter.1d4.us/${u}/rss` },
  { buildUrl: (u) => `https://nitter.kavin.rocks/${u}/rss` },
  { buildUrl: (u) => `https://xcancel.com/${u}/rss` },
  { buildUrl: (u) => `https://twiiit.com/${u}/rss` },
]

const HEADERS = { 'User-Agent': 'GoodMorning/1.0 (RSS reader; spec §4.5)' }
/** Per-source timeout — fail fast and let Promise.any() win with the first working source. */
const PER_SOURCE_TIMEOUT_MS = 5_000

/** Fetches the latest post per followed handle — all sources tried in parallel. */
export class TweetRssService {
  async getTweets(handles: string[] = TWEET_FOLLOWS): Promise<Tweet[]> {
    const results = await Promise.all(handles.map((h) => this.fetchLatest(h)))
    return results.filter((t): t is Tweet => t !== null)
  }

  private async fetchLatest(handle: string): Promise<Tweet | null> {
    const username = handle.replace(/^@/, '')

    const attempts = RSS_SOURCES.map(async (source): Promise<Tweet> => {
      const url = source.buildUrl(username)
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(PER_SOURCE_TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const xml = await res.text()
      const tweet = parseTweetRss(xml, handle)
      if (!tweet) throw new Error('empty feed')
      return tweet
    })

    try {
      return await Promise.any(attempts)
    } catch {
      return null
    }
  }
}

/** Parse the newest item from a Nitter / RSSHub Twitter RSS feed. Exported for tests. */
export function parseTweetRss(xml: string, handle: string): Tweet | null {
  const block = xml.match(/<item[\s\S]*?<\/item>/i)?.[0]
  if (!block) return null

  const title = tagValue(block, 'title')
  const description = tagValue(block, 'description')
  const pubRaw = tagValue(block, 'pubDate') ?? tagValue(block, 'published')
  const link = tagValue(block, 'link') ?? attrValue(block, 'link', 'href')
  const postedAt = pubRaw ? new Date(pubRaw).toISOString() : new Date().toISOString()

  const { displayName, text } = extractTweetContent(title, description, handle)
  if (!text) return null

  const id = link?.match(/status\/(\d+)/)?.[1] ?? `${handle}:${postedAt}`

  return { id, handle, displayName, text, likes: 0, reposts: 0, postedAt }
}

function extractTweetContent(
  title: string | undefined,
  description: string | undefined,
  handle: string,
): { displayName: string; text: string } {
  const username = handle.replace(/^@/, '')

  if (title) {
    const fromTitle = title.match(/^(.+?)\s*\(@[^)]+\):\s*(.+)$/s)
    if (fromTitle) {
      return { displayName: fromTitle[1]!.trim(), text: stripHtml(fromTitle[2]!.trim()) }
    }
  }

  return { displayName: username, text: stripHtml(description ?? title ?? '') }
}

function stripHtml(raw: string): string {
  return decodeEntities(
    raw
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

function tagValue(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match?.[1]?.trim()
}

function attrValue(block: string, tag: string, attr: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i'))
  return match?.[1]
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
