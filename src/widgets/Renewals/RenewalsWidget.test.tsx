import { render, screen } from '@testing-library/react'
import { RenewalsWidget } from './RenewalsWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders renewals sorted with a relative due countdown', async () => {
  render(<RenewalsWidget />)
  expect(await screen.findByText(/copperkite\.com domain/i)).toBeInTheDocument()
  expect(screen.getByText(/in 4 days/i)).toBeInTheDocument()
  // Overdue VAT return renders in the past tense.
  expect(screen.getByText(/yesterday/i)).toBeInTheDocument()
})

it('tags each renewal as company or personal', async () => {
  render(<RenewalsWidget />)
  expect(await screen.findAllByText(/company/i)).not.toHaveLength(0)
  expect(screen.getAllByText(/personal/i)).not.toHaveLength(0)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getRenewals').mockRejectedValueOnce(new Error('down'))
  render(<RenewalsWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
