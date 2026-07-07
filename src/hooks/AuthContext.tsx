import { createContext, useContext, type ReactNode } from 'react'
import { useAuth, type AuthState } from './useAuth'

export const AuthContext = createContext<AuthState | null>(null)

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(apiBase)
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAppAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAppAuth must be used within AuthProvider')
  }
  return ctx
}
