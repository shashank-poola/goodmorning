import { parseBulletList, type GlmClient } from './glmClient'
import type { Tweet } from './tweetRss'

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

export type TodoPriority = 'high' | 'medium' | 'low'

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

  /**
   * Generates a one-liner insight per tweet — why it matters to a tech founder.
   * Spec §4.5: cheap model for bulk extract/summarize, filed under model tiering.
   */
  async tweetInsight(tweet: Tweet): Promise<string> {
    if (!this.glm.enabled) return tweet.text.slice(0, 80)

    const result = await this.glm.complete(
      'In ONE short sentence (max 14 words), explain why this tweet matters to a tech founder. Plain text.',
      `${tweet.displayName} (${tweet.handle}): ${tweet.text}`,
      60,
    )
    return result ?? tweet.text.slice(0, 80)
  }

  /**
   * Infers todo priority from the text using keywords + LLM fallback.
   * Spec §4.3: LLM performs auto-categorization.
   */
  async categorizeTodo(text: string): Promise<TodoPriority> {
    const lower = text.toLowerCase()

    // Fast keyword heuristics before hitting LLM
    const highKw = /\b(urgent|asap|today|deadline|critical|now|emergency|overdue|must)\b/i
    const lowKw = /\b(someday|maybe|later|eventually|nice.to.have|whenever)\b/i
    if (highKw.test(lower)) return 'high'
    if (lowKw.test(lower)) return 'low'

    if (!this.glm.enabled) return 'medium'

    const result = await this.glm.complete(
      'Classify the urgency of this todo into exactly one word: "high", "medium", or "low". Reply with only that word.',
      text,
      8,
    )
    const word = result?.trim().toLowerCase()
    if (word === 'high' || word === 'low') return word
    return 'medium'
  }

  /**
   * Detects duplicates — returns the existing text that's too similar, or null.
   * Spec §4.3: LLM performs duplicate detection.
   */
  async findDuplicate(newText: string, existingTexts: string[]): Promise<string | null> {
    if (existingTexts.length === 0) return null

    // Exact / near-exact match without LLM
    const lower = newText.toLowerCase().trim()
    const exact = existingTexts.find((t) => t.toLowerCase().trim() === lower)
    if (exact) return exact

    if (!this.glm.enabled) return null

    const list = existingTexts.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join('\n')
    const result = await this.glm.complete(
      'You detect duplicate todos. Given a NEW todo and a numbered list of EXISTING todos, reply with just the number of the existing todo that means the same thing, or "none" if there is no duplicate. One word reply.',
      `NEW: ${newText}\n\nEXISTING:\n${list}`,
      8,
    )

    const word = result?.trim().toLowerCase()
    if (!word || word === 'none') return null
    const idx = parseInt(word, 10)
    if (Number.isNaN(idx) || idx < 1 || idx > existingTexts.length) return null
    return existingTexts[idx - 1] ?? null
  }
}
