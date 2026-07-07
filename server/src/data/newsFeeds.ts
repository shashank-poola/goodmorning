/** RSS feeds mapped to frontend `newsFollows.ts` sources. */
export type NewsCategory = 'tech' | 'world'

export interface NewsFeedSource {
  name: string
  category: NewsCategory
  url: string
}

export const NEWS_FEEDS: NewsFeedSource[] = [
  { name: 'The Verge', category: 'tech', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'InfoQ', category: 'tech', url: 'https://feed.infoq.com/' },
  { name: 'Ars Technica', category: 'tech', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Reuters', category: 'world', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best' },
  { name: 'BBC', category: 'world', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
]
