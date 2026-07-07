import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FinanceDrawer } from './FinanceDrawer'

it('does not render finance content while closed', () => {
  render(<FinanceDrawer open={false} onClose={vi.fn()} />)
  expect(screen.queryByText(/recurring commitments/i)).not.toBeInTheDocument()
})

it('renders renewals and finance content when open', async () => {
  render(<FinanceDrawer open onClose={vi.fn()} />)
  expect(await screen.findByText('AWS')).toBeInTheDocument()
  expect(screen.getByText(/recurring commitments/i)).toBeInTheDocument()
})

it('closes on the close button', async () => {
  const onClose = vi.fn()
  render(<FinanceDrawer open onClose={onClose} />)
  await userEvent.click(screen.getByRole('button', { name: /close finance/i }))
  expect(onClose).toHaveBeenCalledOnce()
})
