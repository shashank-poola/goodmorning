import { describe, expect, it } from 'vitest'
import { parseRss } from './rssNews'

describe('parseRss', () => {
  const feed = { name: 'The Verge', category: 'tech' as const, url: 'https://example.com/rss' }

  it('extracts items from RSS XML', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Test headline</title>
          <link>https://example.com/a</link>
          <pubDate>Mon, 07 Jul 2026 06:40:00 GMT</pubDate>
        </item>
      </channel></rss>`

    const items = parseRss(xml, feed)
    expect(items).toHaveLength(1)
    expect(items[0]!.headline).toBe('Test headline')
    expect(items[0]!.source).toBe('The Verge')
    expect(items[0]!.category).toBe('tech')
  })

  it('returns empty array for invalid XML', () => {
    expect(parseRss('not xml', feed)).toEqual([])
  })
})
