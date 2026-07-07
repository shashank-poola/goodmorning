import type { AccentColor } from '../types/calendar'

const PALETTE: AccentColor[] = ['gold', 'sage', 'blue', 'clay']

/** Stable accent per email so colors don't shuffle between requests. */
export function colorForEmail(email: string): AccentColor {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

export function accountIdFromSub(sub: string): string {
  return `google-${sub}`
}
