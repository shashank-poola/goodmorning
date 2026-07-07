import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../hooks/AuthContext'
import { ThemeProvider } from '../hooks/ThemeContext'
import { Sidebar } from './Sidebar'

function mockAuthFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: false, user: null, accounts: [] }),
    }),
  )
}

function renderSidebar(props: Partial<Parameters<typeof Sidebar>[0]> = {}) {
  mockAuthFetch()
  return render(
    <ThemeProvider>
      <AuthProvider>
        <Sidebar
          onOpenFinance={vi.fn()}
          activeId="top"
          onNavigate={vi.fn()}
          collapsed={false}
          onToggleCollapse={vi.fn()}
          {...props}
        />
      </AuthProvider>
    </ThemeProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

it('scrolls to the target widget on click (mobile)', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )

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

it('shows Overview icon (not Home) for the overview nav item', () => {
  renderSidebar()
  expect(screen.getAllByRole('button', { name: /overview/i })[0]).toBeInTheDocument()
})

it('shows sign-in prompt when no Google account is connected', async () => {
  renderSidebar()
  expect(await screen.findByText('Sign in')).toBeInTheDocument()
  expect(screen.getByText('Connect Google account')).toBeInTheDocument()
})
