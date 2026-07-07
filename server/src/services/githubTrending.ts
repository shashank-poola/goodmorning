export interface RepoTrend {
  id: string
  name: string
  description: string
  language: string
  starsToday: number
  url: string
}

interface GitHubSearchResponse {
  items?: Array<{
    id: number
    full_name: string
    description: string | null
    language: string | null
    stargazers_count: number
    html_url: string
    created_at: string
  }>
}

/** GitHub search API — free, no auth for light usage (spec §4.4 GitHub tab). */
export class GitHubTrendingService {
  async getTrending(): Promise<RepoTrend[]> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const q = encodeURIComponent(`created:>=${since}`)
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`

    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'GoodMorning/1.0',
        },
        signal: AbortSignal.timeout(8_000),
      })
      if (!res.ok) return []
      const data = (await res.json()) as GitHubSearchResponse
      return (data.items ?? []).map((repo) => ({
        id: String(repo.id),
        name: repo.full_name,
        description: repo.description ?? '',
        language: repo.language ?? '—',
        starsToday: repo.stargazers_count,
        url: repo.html_url,
      }))
    } catch {
      return []
    }
  }
}
