import { render, screen, waitFor } from '@testing-library/react'
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

it('renders an empty bar without crashing when the provider rejects', async () => {
  vi.spyOn(provider, 'getStocks').mockRejectedValueOnce(new Error('network error'))
  const { container } = render(<TickerBar />)
  await waitFor(() => expect(container.querySelectorAll('span').length).toBe(0))
  expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
})
