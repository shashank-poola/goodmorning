/** Mirrors src/data/types.ts — keep in sync when the contract changes. */
export type AccentColor = 'gold' | 'sage' | 'blue' | 'clay'

export interface CalendarSource {
  id: string
  name: string
  color: AccentColor
}

export interface CalendarEvent {
  id: string
  sourceId: string
  title: string
  start: string
  end: string
  location?: string
  meetLink?: string
}

export interface CalendarResponse {
  sources: CalendarSource[]
  events: CalendarEvent[]
}

export interface AuthStatusAccount {
  id: string
  email: string
  name: string
  color: AccentColor
}

export interface AuthStatusResponse {
  connected: boolean
  accounts: AuthStatusAccount[]
}

export interface StoredGoogleTokens {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
  token_type?: string | null
  scope?: string
}

export interface StoredAccount {
  id: string
  email: string
  sub: string
  color: AccentColor
  tokens: StoredGoogleTokens
  connectedAt: string
}

export interface TokenStoreData {
  accounts: StoredAccount[]
}
