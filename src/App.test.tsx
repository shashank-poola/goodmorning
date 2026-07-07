import { render, screen } from '@testing-library/react'
import { AuthProvider } from './hooks/AuthContext'
import { ThemeProvider } from './hooks/ThemeContext'
import { App } from './App'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: false, user: null, accounts: [] }),
    }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders topbar clock and sidebar navigation', async () => {
  render(
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>,
  )
  expect(screen.getByTestId('clock-IST')).toBeInTheDocument()
  expect(screen.getByTestId('clock-GMT')).toBeInTheDocument()
  expect(screen.getByTestId('clock-EST')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: /sections/i })).toBeInTheDocument()
})
