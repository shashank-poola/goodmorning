import { describe, expect, it } from 'vitest'
import { GlmClient, parseBulletList } from './glmClient'
import { IntelligenceService } from './intelligenceService'

describe('parseBulletList', () => {
  it('parses JSON arrays', () => {
    expect(parseBulletList('["One", "Two"]')).toEqual(['One', 'Two'])
  })

  it('parses markdown bullets', () => {
    expect(parseBulletList('- First\n- Second')).toEqual(['First', 'Second'])
  })
})

describe('IntelligenceService (offline)', () => {
  const svc = new IntelligenceService(new GlmClient(undefined))

  it('returns fallback email intel without API key', async () => {
    await expect(
      svc.whyEmailMatters({ sender: 'Ana', subject: 'Roadmap', preview: 'Hi' }),
    ).resolves.toBe('Review: Roadmap')
  })

  it('returns fallback recap bullets without API key', async () => {
    const bullets = await svc.yesterdayRecap('context')
    expect(bullets.length).toBeGreaterThan(0)
  })
})
