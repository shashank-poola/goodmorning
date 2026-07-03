import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsWidget } from './NewsWidget'

afterEach(() => {
  vi.restoreAllMocks()
})

it('shows tech news by default and switches tabs', async () => {
  render(<NewsWidget />)
  expect(await screen.findByText(/claude 5 family/i)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('tab', { name: /world/i }))
  expect(await screen.findByText(/markets rally/i)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('tab', { name: /github/i }))
  expect(await screen.findByText('anthropics/claude-code')).toBeInTheDocument()
  expect(screen.getByText(/\+842/)).toBeInTheDocument()
})
