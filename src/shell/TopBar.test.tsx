import { act, render, screen } from '@testing-library/react'
import { TopBar } from './TopBar'

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
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByTestId('clock')).toHaveTextContent('08:15:01')
  vi.useRealTimers()
})
