import { render, screen } from '@testing-library/react'
import { provider } from '../data/providerFactory'
import { TickerBar } from './TickerBar'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders each stock twice (duplicated marquee track) with signed change', async () => {
  render(<TickerBar />)
  expect((await screen.findAllByText('AAPL')).length).toBe(2)
  expect(screen.getAllByText('+1.2%')[0]).toBeInTheDocument()
  expect(screen.getAllByText('−2.1%')[0]).toBeInTheDocument()
})

it('renders an empty aria-hidden bar while loading, without crashing', () => {
  const { container } = render(<TickerBar />)
  expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
})

it('shows a quiet inline error with retry when the provider rejects', async () => {
  vi.spyOn(provider, 'getStocks').mockRejectedValueOnce(new Error('network error'))
  render(<TickerBar />)
  expect(await screen.findByText(/market data unavailable/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
})
