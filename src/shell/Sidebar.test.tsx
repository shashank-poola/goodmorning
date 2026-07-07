import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../hooks/ThemeContext'
import { Sidebar } from './Sidebar'

function renderSidebar(props: Partial<Parameters<typeof Sidebar>[0]> = {}) {
  return render(
    <ThemeProvider>
      <Sidebar
        onOpenFinance={vi.fn()}
        activeId="top"
        onNavigate={vi.fn()}
        collapsed={false}
        onToggleCollapse={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  )
}

it('scrolls to the target widget on click', async () => {
  const target = document.createElement('section')
  target.id = 'calendar'
  target.scrollIntoView = vi.fn()
  document.body.appendChild(target)

  renderSidebar()
  await userEvent.click(screen.getAllByRole('button', { name: 'Calendar' })[0]!)
  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  target.remove()
})

it('opens the finance drawer instead of scrolling on Finance click', async () => {
  const onOpenFinance = vi.fn()
  renderSidebar({ onOpenFinance })
  await userEvent.click(screen.getAllByRole('button', { name: 'Finance' })[0]!)
  expect(onOpenFinance).toHaveBeenCalledOnce()
})

it('calls onToggleCollapse when the collapse button is clicked', async () => {
  const onToggleCollapse = vi.fn()
  renderSidebar({ onToggleCollapse })
  await userEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }))
  expect(onToggleCollapse).toHaveBeenCalledOnce()
})
