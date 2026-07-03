import { render, screen } from '@testing-library/react'
import { App } from './App'

it('renders topbar clock and sidebar navigation', () => {
  render(<App />)
  expect(screen.getByTestId('clock')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: /sections/i })).toBeInTheDocument()
})
