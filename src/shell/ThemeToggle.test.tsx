import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

it('toggles between light and dark and persists the choice', async () => {
  render(<ThemeToggle />)
  await userEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(localStorage.getItem('gm-theme')).toBe('dark')

  await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  expect(localStorage.getItem('gm-theme')).toBe('light')
})

it('restores a persisted theme on mount', () => {
  localStorage.setItem('gm-theme', 'dark')
  render(<ThemeToggle />)
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
})
