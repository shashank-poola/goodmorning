import { useCallback, useEffect, useState } from 'react'

interface WidgetState<T> {
  data: T | null
  loading: boolean
  error: boolean
}

/**
 * Uniform data lifecycle for every widget. `fetcher` MUST be referentially
 * stable (provider methods are arrow-function class properties, so passing
 * `provider.getX` directly is safe).
 */
export function useWidgetData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<WidgetState<T>>({ data: null, loading: true, error: false })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: false })
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, loading: false, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { ...state, retry }
}
