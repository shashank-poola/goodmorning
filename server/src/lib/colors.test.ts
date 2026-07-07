import { describe, expect, it } from 'vitest'
import { accountIdFromSub, colorForEmail } from './colors'

describe('colorForEmail', () => {
  it('returns a stable accent for the same email', () => {
    expect(colorForEmail('work@gmail.com')).toBe(colorForEmail('work@gmail.com'))
  })

  it('only returns palette colors', () => {
    const color = colorForEmail('another@example.com')
    expect(['gold', 'sage', 'blue', 'clay']).toContain(color)
  })
})

describe('accountIdFromSub', () => {
  it('prefixes Google subject ids', () => {
    expect(accountIdFromSub('12345')).toBe('google-12345')
  })
})
