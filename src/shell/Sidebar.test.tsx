import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'

it('scrolls to the target widget on click', async () => {
  const target = document.createElement('section')
  target.id = 'calendar'
  target.scrollIntoView = vi.fn()
  document.body.appendChild(target)

  render(<Sidebar onOpenFinance={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /calendar/i }))
  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  target.remove()
})

it('opens the finance drawer instead of scrolling on Finance click', async () => {
  const onOpenFinance = vi.fn()
  render(<Sidebar onOpenFinance={onOpenFinance} />)
  await userEvent.click(screen.getByRole('button', { name: /finance/i }))
  expect(onOpenFinance).toHaveBeenCalledOnce()
})
