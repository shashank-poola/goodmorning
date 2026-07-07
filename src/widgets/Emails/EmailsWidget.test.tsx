import { render, screen } from '@testing-library/react'
import { EmailsWidget } from './EmailsWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders emails with sender, subject, and status dots', async () => {
  render(<EmailsWidget />)
  expect(await screen.findByText('Ana Duarte')).toBeInTheDocument()
  expect(screen.getByText(/q3 roadmap/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('status-dot').length).toBeGreaterThanOrEqual(2)
})

it('shows unread status on important emails', async () => {
  render(<EmailsWidget />)
  await screen.findByText('Ana Duarte')
  const unreadDots = screen.getAllByTestId('status-dot').filter(
    (el) => el.getAttribute('data-status') === 'unread',
  )
  expect(unreadDots.length).toBeGreaterThan(0)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getEmails').mockRejectedValueOnce(new Error('down'))
  render(<EmailsWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
