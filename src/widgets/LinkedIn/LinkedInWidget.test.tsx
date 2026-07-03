import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinkedInWidget } from './LinkedInWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders follower delta, post stats, and messages', async () => {
  render(<LinkedInWidget />)
  expect(await screen.findByText('+27')).toBeInTheDocument()
  expect(screen.getByText(/12,480/)).toBeInTheDocument()
  expect(screen.getByText('Riya Kapoor')).toBeInTheDocument()
})

it('copies the suggested reply to clipboard', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<LinkedInWidget />)
  await screen.findByText('Riya Kapoor')
  await userEvent.click(screen.getAllByRole('button', { name: /copy reply/i })[0])
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Thanks Riya'))
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getLinkedIn').mockRejectedValueOnce(new Error('down'))
  render(<LinkedInWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
