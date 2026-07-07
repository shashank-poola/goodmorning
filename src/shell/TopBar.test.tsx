import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../hooks/ThemeContext'
import { TopBar } from './TopBar'

function renderTopBar(onOpenSearch = vi.fn()) {
  return render(
    <ThemeProvider>
      <TopBar onOpenSearch={onOpenSearch} />
    </ThemeProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders three live time-zone clocks (IST/GMT/EST) that tick every second', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-03T12:00:00Z'))
  renderTopBar()
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

it('opens command palette from the search button', async () => {
  const onOpenSearch = vi.fn()
  renderTopBar(onOpenSearch)
  await userEvent.click(screen.getByRole('button', { name: /open command palette/i }))
  expect(onOpenSearch).toHaveBeenCalledOnce()
})
