import { useCallback, useEffect, useState } from 'react'
import type { AuthStatus } from '../data/authTypes'
import { GOOGLE_AUTH_URL } from '../data/authTypes'

const DISCONNECTED: AuthStatus = {
  connected: false,
  user: null,
  accounts: [],
}

function authUrl(apiBase: string): string {
  return `${apiBase}/api/auth/status`.replace(/([^:]\/)\/+/g, '$1')
}

export function useAuth(apiBase = '') {
  const [status, setStatus] = useState<AuthStatus>(DISCONNECTED)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(authUrl(apiBase))
      if (!res.ok) {
        setStatus(DISCONNECTED)
        return
      }
      const data = (await res.json()) as AuthStatus
      setStatus(data)
    } catch {
      setStatus(DISCONNECTED)
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const connect = useCallback(() => {
    window.location.href = GOOGLE_AUTH_URL
  }, [])

  return { ...status, loading, refresh, connect, connectUrl: GOOGLE_AUTH_URL }
}

export type AuthState = ReturnType<typeof useAuth>
