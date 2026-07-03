import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComposeBar } from './ComposeBar'

afterEach(() => {
  vi.restoreAllMocks()
})

it('toggles platform chips and keeps Post disabled in v1', async () => {
  render(<ComposeBar />)
  const linkedin = screen.getByRole('button', { name: 'LinkedIn' })
  expect(linkedin).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(linkedin)
  expect(linkedin).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: /post/i })).toBeDisabled()
})
