import { parseBulletList, type GlmClient } from './glmClient'

export interface EmailIntelInput {
  sender: string
  subject: string
  preview: string
}

export interface LinkedInMessageInput {
  from: string
  preview: string
}

export interface NewsIntelInput {
  headline: string
  source: string
}

/** LLM intelligence layer — spec §4 email, news, recap, LinkedIn. */
export class IntelligenceService {
  constructor(private readonly glm: GlmClient) {}

  async whyEmailMatters(email: EmailIntelInput): Promise<string> {
    const fallback = `Review: ${email.subject}`
    if (!this.glm.enabled) return fallback

    const result = await this.glm.complete(
      'You help a busy founder triage email. Reply with ONE short sentence (max 14 words) explaining why this email needs attention. Plain text only.',
      `From: ${email.sender}\nSubject: ${email.subject}\nPreview: ${email.preview}`,
      80,
    )
    return result ?? fallback
  }

  async yesterdayRecap(context: string): Promise<string[]> {
    const fallback = [
      'Scan calendar and inbox to set today’s priorities.',
      'Check open todos before deep work.',
    ]
    if (!this.glm.enabled) return fallback

    const result = await this.glm.complete(
      'Summarize yesterday for a founder dashboard. Return a JSON array of 3–4 short bullet strings. JSON only, no markdown.',
      context,
      400,
    )
    if (!result) return fallback

    const bullets = parseBulletList(result)
    return bullets.length > 0 ? bullets.slice(0, 4) : fallback
  }

  async linkedInReply(message: LinkedInMessageInput): Promise<string> {
    const fallback = `Thanks ${message.from.split(' ')[0]}, appreciate you reaching out!`
    if (!this.glm.enabled) return fallback

    const result = await this.glm.complete(
      'Draft a warm, concise LinkedIn reply in the user\'s voice (2 sentences max). Plain text only — ready to copy-paste.',
      `From: ${message.from}\nMessage: ${message.preview}`,
      160,
    )
    return result ?? fallback
  }

  async newsInsight(item: NewsIntelInput): Promise<string> {
    const fallback = `${item.source}: worth a skim today.`
    if (!this.glm.enabled) return fallback

    const result = await this.glm.complete(
      'Explain in ONE sentence why this headline matters to a tech founder. Plain text only, max 16 words.',
      `${item.source}: ${item.headline}`,
      64,
    )
    return result ?? fallback
  }

  async linkedInPasteReplies(pasted: string): Promise<string[]> {
    const fallback = ['Thanks for sharing — great to connect here.']
    if (!this.glm.enabled) return fallback

    const result = await this.glm.complete(
      'The user pasted LinkedIn post text and comments. Return a JSON array of reply drafts — one per comment thread, warm and concise. JSON array only.',
      pasted,
      600,
    )
    if (!result) return fallback

    const replies = parseBulletList(result)
    return replies.length > 0 ? replies : fallback
  }
}
