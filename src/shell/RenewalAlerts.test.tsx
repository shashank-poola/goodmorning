import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RenewalAlerts } from './RenewalAlerts'
import { provider } from '../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('floats only the urgent renewals (overdue or within 7 days)', async () => {
  render(<RenewalAlerts onOpenFinance={vi.fn()} />)
  // VAT (overdue), liability insurance (tomorrow), domain (in 4 days) = 3.
  expect(await screen.findByText(/3 reminders need attention/i)).toBeInTheDocument()
  expect(screen.getByText(/vat return/i)).toBeInTheDocument()
  // Car MOT is 12 days out — not urgent, should not appear.
  expect(screen.queryByText(/car mot/i)).not.toBeInTheDocument()
})

it('opens finance when a chip is clicked', async () => {
  const onOpenFinance = vi.fn()
  render(<RenewalAlerts onOpenFinance={onOpenFinance} />)
  await screen.findByText(/reminders need attention/i)
  await userEvent.click(screen.getByText(/vat return/i))
  expect(onOpenFinance).toHaveBeenCalled()
})

it('can be dismissed', async () => {
  render(<RenewalAlerts onOpenFinance={vi.fn()} />)
  await screen.findByTestId('renewal-alerts')
  await userEvent.click(screen.getByRole('button', { name: /dismiss reminders/i }))
  expect(screen.queryByTestId('renewal-alerts')).not.toBeInTheDocument()
})

it('renders nothing when there are no urgent renewals', async () => {
  const spy = vi.spyOn(provider, 'getRenewals').mockResolvedValueOnce([])
  render(<RenewalAlerts onOpenFinance={vi.fn()} />)
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(screen.queryByTestId('renewal-alerts')).not.toBeInTheDocument()
})
