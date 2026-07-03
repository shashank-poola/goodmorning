import { render, screen } from '@testing-library/react'
import { UsageWidget } from './UsageWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders yesterday tokens, sessions, cost and comparison bars', async () => {
  render(<UsageWidget />)
  // '1.2M' also appears in the Yesterday chart row (same tokens value formatted the
  // same way), so a bare getByText('1.2M') is ambiguous — scope to the headline via testid.
  expect(await screen.findByTestId('usage-total')).toHaveTextContent('1.2M')
  expect(screen.getByText(/14 sessions/i)).toBeInTheDocument()
  expect(screen.getByText('$38.20')).toBeInTheDocument()
  expect(screen.getAllByTestId('usage-bar')).toHaveLength(2)
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getUsageStats').mockRejectedValueOnce(new Error('down'))
  render(<UsageWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
