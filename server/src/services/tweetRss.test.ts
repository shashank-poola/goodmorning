import { describe, expect, it } from 'vitest'
import { parseTweetRss } from './tweetRss'

describe('parseTweetRss', () => {
  it('extracts display name, text, and date from Nitter-style RSS', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Paul Graham (@paulg): The best founders are relentlessly resourceful.</title>
          <link>https://nitter.example/paulg/status/1234567890</link>
          <pubDate>Mon, 07 Jul 2026 06:30:00 GMT</pubDate>
        </item>
      </channel></rss>`

    const tweet = parseTweetRss(xml, '@paulg')
    expect(tweet).toMatchObject({
      id: '1234567890',
      handle: '@paulg',
      displayName: 'Paul Graham',
      text: 'The best founders are relentlessly resourceful.',
      likes: 0,
      reposts: 0,
    })
    expect(tweet!.postedAt).toBeTruthy()
  })

  it('falls back to description when title is missing', () => {
    const xml = `<rss><channel><item>
      <description><![CDATA[<p>Hello world</p>]]></description>
      <pubDate>Mon, 07 Jul 2026 05:00:00 GMT</pubDate>
    </item></channel></rss>`

    const tweet = parseTweetRss(xml, '@naval')
    expect(tweet?.text).toBe('Hello world')
    expect(tweet?.displayName).toBe('naval')
  })

  it('returns null for empty feeds', () => {
    expect(parseTweetRss('<rss><channel></channel></rss>', '@paulg')).toBeNull()
  })
})
