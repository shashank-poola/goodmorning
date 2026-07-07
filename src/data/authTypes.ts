export interface AuthUser {
  name: string
  email: string
  initial: string
}

export interface AuthAccount {
  id: string
  email: string
  name: string
  color: string
}

export interface AuthStatus {
  connected: boolean
  user: AuthUser | null
  accounts: AuthAccount[]
}

export const GOOGLE_AUTH_URL = '/auth/google'
