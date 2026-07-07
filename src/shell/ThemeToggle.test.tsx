import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../hooks/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

it('toggles between light and dark and persists the choice', async () => {
  renderToggle()
  await userEvent.click(screen.getByLabelText(/switch to light mode/i))
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  expect(localStorage.getItem('gm-theme')).toBe('light')

  await userEvent.click(screen.getByLabelText(/switch to dark mode/i))
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(localStorage.getItem('gm-theme')).toBe('dark')
})

it('restores a persisted theme on mount', () => {
  localStorage.setItem('gm-theme', 'dark')
  renderToggle()
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument()
})
