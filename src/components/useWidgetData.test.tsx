import { renderHook, waitFor, act } from '@testing-library/react'
import { useWidgetData } from './useWidgetData'

it('goes loading → data', async () => {
  const fetcher = () => Promise.resolve('hello')
  const { result } = renderHook(() => useWidgetData(fetcher))
  expect(result.current.loading).toBe(true)
  await waitFor(() => expect(result.current.data).toBe('hello'))
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBe(false)
})

it('goes loading → error, and retry refetches', async () => {
  let calls = 0
  const fetcher = () => {
    calls++
    return calls === 1 ? Promise.reject(new Error('boom')) : Promise.resolve('recovered')
  }
  const { result } = renderHook(() => useWidgetData(fetcher))
  await waitFor(() => expect(result.current.error).toBe(true))
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.data).toBe('recovered'))
})

it('does not set state after unmount when the fetch resolves late', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  let resolveFetch: (value: string) => void = () => {}
  const fetcher = () =>
    new Promise<string>((resolve) => {
      resolveFetch = resolve
    })

  const { unmount } = renderHook(() => useWidgetData(fetcher))
  unmount()

  await act(async () => {
    resolveFetch('too late')
    await Promise.resolve()
  })

  expect(errorSpy).not.toHaveBeenCalled()
  errorSpy.mockRestore()
})
