import { describe, expect, it } from 'vitest'
import { parseSenderName } from './googleGmail'

describe('parseSenderName', () => {
  it('extracts display name from angle-bracket format', () => {
    expect(parseSenderName('Ana Duarte <ana@example.com>')).toBe('Ana Duarte')
  })

  it('falls back to local part for bare email', () => {
    expect(parseSenderName('github@notifications.github.com')).toBe('github')
  })

  it('returns the raw string when no pattern matches', () => {
    expect(parseSenderName('GitHub')).toBe('GitHub')
  })
})
