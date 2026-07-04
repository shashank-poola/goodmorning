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

it('renders three live time-zone clocks (IST/GMT/EST) that tick every second', async () => {
  vi.useFakeTimers()
  // Anchor to a fixed UTC instant so expectations are machine-timezone-independent.
  vi.setSystemTime(new Date('2026-07-03T12:00:00Z'))
  render(<TopBar />)
  // GMT = UTC, IST = UTC+5:30, EST(New York, July = EDT) = UTC-4
  expect(screen.getByTestId('clock-GMT')).toHaveTextContent('12:00:00')
  expect(screen.getByTestId('clock-IST')).toHaveTextContent('17:30:00')
  expect(screen.getByTestId('clock-EST')).toHaveTextContent('08:00:00')
  await act(async () => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByTestId('clock-GMT')).toHaveTextContent('12:00:01')
  expect(screen.getByTestId('clock-IST')).toHaveTextContent('17:30:01')
  vi.useRealTimers()
})

it('shows a quiet fallback quote when the provider rejects', async () => {
  vi.spyOn(provider, 'getQuote').mockRejectedValueOnce(new Error('network error'))
  render(<TopBar />)
  expect(await screen.findByText(/every morning is a fresh beginning/i)).toBeInTheDocument()
  expect(screen.getByText(/proverb/i)).toBeInTheDocument()
})
