import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'

it('shows a daily quote and author', () => {
  render(<PageHeader onOpenFinance={vi.fn()} />)
  const quote = screen.getByTestId('daily-quote')
  expect(quote.textContent?.length).toBeGreaterThan(10)
})

it('shows the Open Finance button', () => {
  render(<PageHeader onOpenFinance={vi.fn()} />)
  expect(screen.getByRole('button', { name: /open finance/i })).toBeInTheDocument()
})

it('calls onOpenFinance when the button is clicked', async () => {
  const { userEvent: ue } = await import('@testing-library/user-event')
  const fn = vi.fn()
  render(<PageHeader onOpenFinance={fn} />)
  const user = ue.setup()
  await user.click(screen.getByRole('button', { name: /open finance/i }))
  expect(fn).toHaveBeenCalledOnce()
})
