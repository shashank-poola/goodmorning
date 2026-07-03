import { render, screen } from '@testing-library/react'
import { RecapWidget } from './RecapWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders recap bullets', async () => {
  render(<RecapWidget />)
  expect(await screen.findByText(/attended 4 meetings/i)).toBeInTheDocument()
  expect(screen.getByText(/merged 3 prs/i)).toBeInTheDocument()
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getYesterdayRecap').mockRejectedValueOnce(new Error('down'))
  render(<RecapWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
