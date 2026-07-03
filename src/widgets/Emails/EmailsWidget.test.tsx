import { render, screen } from '@testing-library/react'
import { EmailsWidget } from './EmailsWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders emails with sender, subject, and mailbox dot', async () => {
  render(<EmailsWidget />)
  expect(await screen.findByText('Ana Duarte')).toBeInTheDocument()
  expect(screen.getByText(/q3 roadmap/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('mailbox-dot').length).toBeGreaterThan(2)
})

it('marks unread emails', async () => {
  render(<EmailsWidget />)
  await screen.findByText('Ana Duarte')
  expect(screen.getAllByTestId('unread-dot').length).toBeGreaterThan(0)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getEmails').mockRejectedValueOnce(new Error('down'))
  render(<EmailsWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
