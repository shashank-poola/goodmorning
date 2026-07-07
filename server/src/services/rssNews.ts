import type { NewsFeedSource } from '../data/newsFeeds'

export interface NewsItem {
  id: string
  category: 'tech' | 'world'
  headline: string
  source: string
  publishedAt: string
  url: string
  insight?: string
}

const MAX_PER_FEED = 3
const MAX_AGE_MS = 48 * 60 * 60 * 1000

/** Fetch and merge RSS feeds — free, no API key (spec §4.4). */
export class RssNewsService {
  async getNews(feeds: NewsFeedSource[]): Promise<NewsItem[]> {
    const groups = await Promise.all(feeds.map((feed) => this.fetchFeed(feed)))
    return groups
      .flat()
      .filter((item) => Date.now() - Date.parse(item.publishedAt) <= MAX_AGE_MS)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  }

  private async fetchFeed(feed: NewsFeedSource): Promise<NewsItem[]> {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'GoodMorning/1.0 (RSS reader)' },
        signal: AbortSignal.timeout(8_000),
      })
      if (!res.ok) return []
      const xml = await res.text()
      return parseRss(xml, feed).slice(0, MAX_PER_FEED)
    } catch {
      return []
    }
  }
}

export function parseRss(xml: string, feed: NewsFeedSource): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? []

  for (const block of blocks) {
    const headline = tagValue(block, 'title')
    const url = tagValue(block, 'link') ?? attrValue(block, 'link', 'href')
    if (!headline || !url) continue

    const pubRaw = tagValue(block, 'pubDate') ?? tagValue(block, 'updated') ?? tagValue(block, 'published')
    const publishedAt = pubRaw ? new Date(pubRaw).toISOString() : new Date().toISOString()
    const slug = url.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)

    items.push({
      id: `${feed.name}:${slug}:${items.length}`,
      category: feed.category,
      headline: decodeEntities(headline),
      source: feed.name,
      publishedAt,
      url,
    })
  }

  return items
}

function tagValue(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match?.[1]?.trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim()
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
