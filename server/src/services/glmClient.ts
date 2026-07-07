/** Thin wrapper around Z.AI / GLM chat completions (OpenAI-compatible). */
export class GlmClient {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly model = process.env.ZAI_MODEL ?? 'glm-5.2',
    private readonly baseUrl = 'https://api.z.ai/api/paas/v4/chat/completions',
  ) {}

  get enabled(): boolean {
    return Boolean(this.apiKey)
  }

  async complete(system: string, user: string, maxTokens = 512): Promise<string | null> {
    if (!this.apiKey) return null

    try {
      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'Accept-Language': 'en-US,en',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.3,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(30_000),
      })

      if (!res.ok) return null

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      return data.choices?.[0]?.message?.content?.trim() ?? null
    } catch {
      return null
    }
  }
}

/** Parse JSON array or markdown bullet list from model output. */
export function parseBulletList(text: string): string[] {
  try {
    const parsed = JSON.parse(text) as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    }
  } catch {
    /* fall through */
  }

  return text
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.)]+\s*/, '').trim())
    .filter(Boolean)
}
