import { render, screen, fireEvent } from '@testing-library/react'
import { FinanceWidget } from './FinanceWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('lists recurring commitments and expenses with the paying account', async () => {
  render(<FinanceWidget />)
  expect(await screen.findByText('AWS')).toBeInTheDocument()
  expect(screen.getByText('Netflix')).toBeInTheDocument()
  expect(screen.getByText('Office chair')).toBeInTheDocument()
  // "Paid from" account surfaces on rows.
  expect(screen.getAllByText(/amex business/i).length).toBeGreaterThan(0)
})

it('filters to company-only when the Company segment is chosen', async () => {
  render(<FinanceWidget />)
  await screen.findByText('AWS')
  fireEvent.click(screen.getByRole('button', { name: 'Company' }))
  expect(screen.getByText('AWS')).toBeInTheDocument()
  expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
})

it('filters to personal-only when the Personal segment is chosen', async () => {
  render(<FinanceWidget />)
  await screen.findByText('Netflix')
  fireEvent.click(screen.getByRole('button', { name: 'Personal' }))
  expect(screen.getByText('Netflix')).toBeInTheDocument()
  expect(screen.queryByText('AWS')).not.toBeInTheDocument()
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getFinance').mockRejectedValueOnce(new Error('down'))
  render(<FinanceWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
