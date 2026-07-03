import { render, screen } from '@testing-library/react'
import { CalendarWidget } from './CalendarWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders today’s events with source color dots', async () => {
  render(<CalendarWidget />)
  expect(await screen.findByText('Standup')).toBeInTheDocument()
  expect(screen.getByText(/design review/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('source-dot').length).toBeGreaterThan(2)
})

it('renders a physical location when present, and falls back to Video call for meet-link-only events', async () => {
  render(<CalendarWidget />)
  expect(await screen.findByText('Room 4B')).toBeInTheDocument()
  expect(screen.getAllByText('Video call ↗').length).toBeGreaterThan(0)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getCalendar').mockRejectedValueOnce(new Error('down'))
  render(<CalendarWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
