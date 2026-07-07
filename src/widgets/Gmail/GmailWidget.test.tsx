import { render, screen } from '@testing-library/react'
import { GmailWidget } from './GmailWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders the full inbox with an unread summary', async () => {
  render(<GmailWidget />)
  expect(await screen.findByText('Ana Duarte')).toBeInTheDocument()
  expect(screen.getByText('Mom')).toBeInTheDocument()
  expect(screen.getByText(/unread/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('mailbox-dot').length).toBe(5)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getEmails').mockRejectedValueOnce(new Error('down'))
  render(<GmailWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
