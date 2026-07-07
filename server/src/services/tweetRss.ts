import { TWEET_FOLLOWS } from '../data/tweetFollows'

export interface Tweet {
  id: string
  handle: string
  displayName: string
  text: string
  likes: number
  reposts: number
  postedAt: string
}

/** Free RSS mirrors for X — try in order until one responds (spec §4.5). */
const RSS_BASES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
]

const FETCH_OPTS = {
  headers: { 'User-Agent': 'GoodMorning/1.0 (RSS reader)' },
  signal: AbortSignal.timeout(8_000),
}

/** Latest post per followed handle via RSS — no API key required. */
export class TweetRssService {
  async getTweets(handles: string[] = TWEET_FOLLOWS): Promise<Tweet[]> {
    const results = await Promise.all(handles.map((handle) => this.fetchLatest(handle)))
    return results.filter((t): t is Tweet => t !== null)
  }

  private async fetchLatest(handle: string): Promise<Tweet | null> {
    const username = handle.replace(/^@/, '')

    for (const base of RSS_BASES) {
      try {
        const res = await fetch(`${base}/${username}/rss`, FETCH_OPTS)
        if (!res.ok) continue
        const xml = await res.text()
        const tweet = parseTweetRss(xml, handle)
        if (tweet) return tweet
      } catch {
        /* try next mirror */
      }
    }

    return null
  }
}

/** Parse the newest item from a Nitter-style RSS feed. Exported for tests. */
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

  return {
    id,
    handle,
    displayName,
    text,
    likes: 0,
    reposts: 0,
    postedAt,
  }
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
      return {
        displayName: fromTitle[1]!.trim(),
        text: stripHtml(fromTitle[2]!.trim()),
      }
    }
  }

  const plain = stripHtml(description ?? title ?? '')
  return {
    displayName: username,
    text: plain,
  }
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
