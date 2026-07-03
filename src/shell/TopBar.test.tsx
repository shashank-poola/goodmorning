import { act, render, screen } from '@testing-library/react'
import { provider } from '../data/providerFactory'
import { TopBar } from './TopBar'

afterEach(() => {
  vi.restoreAllMocks()
})

it('shows the daily quote from the provider', async () => {
  render(<TopBar />)
  expect(await screen.findByText(/getting started/i)).toBeInTheDocument()
  expect(screen.getByText(/mark twain/i)).toBeInTheDocument()
})

it('renders a live clock that ticks every second', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-03T08:15:00'))
  render(<TopBar />)
  expect(screen.getByTestId('clock')).toHaveTextContent('08:15:00')
  await act(async () => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByTestId('clock')).toHaveTextContent('08:15:01')
  vi.useRealTimers()
})

it('shows a quiet fallback quote when the provider rejects', async () => {
  vi.spyOn(provider, 'getQuote').mockRejectedValueOnce(new Error('network error'))
  render(<TopBar />)
  expect(await screen.findByText(/every morning is a fresh beginning/i)).toBeInTheDocument()
  expect(screen.getByText(/proverb/i)).toBeInTheDocument()
})
