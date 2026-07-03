import { render, screen } from '@testing-library/react'
import { TweetsWidget } from './TweetsWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders tweets with handle and engagement', async () => {
  render(<TweetsWidget />)
  expect(await screen.findByText('@paulg')).toBeInTheDocument()
  expect(screen.getByText(/relentlessly resourceful/i)).toBeInTheDocument()
  expect(screen.getByText('4.2k')).toBeInTheDocument()
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getTweets').mockRejectedValueOnce(new Error('down'))
  render(<TweetsWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
