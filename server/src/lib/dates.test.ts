import { describe, expect, it } from 'vitest'
import { todayWindow } from './dates'

describe('todayWindow', () => {
  it('returns start and end bounds for the given timezone', () => {
    const now = new Date('2026-07-07T12:00:00.000Z')
    const { timeMin, timeMax } = todayWindow('Europe/London', now)

    expect(timeMin < timeMax).toBe(true)
    expect(timeMin).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(timeMax).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
