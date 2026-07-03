import { render, screen } from '@testing-library/react'
import { RemindersWidget } from './RemindersWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders reminders with days-until countdown', async () => {
  render(<RemindersWidget />)
  expect(await screen.findByText(/mom's birthday/i)).toBeInTheDocument()
  expect(screen.getByText(/in 2 days/i)).toBeInTheDocument()
  expect(screen.getByText(/today/i)).toBeInTheDocument()
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getReminders').mockRejectedValueOnce(new Error('down'))
  render(<RemindersWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
