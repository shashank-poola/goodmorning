import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodosWidget } from './TodosWidget'
import { provider } from '../../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders todos and toggles done state on click', async () => {
  render(<TodosWidget />)
  const item = await screen.findByRole('checkbox', { name: /prep notes/i })
  expect(item).not.toBeChecked()
  await userEvent.click(item)
  expect(item).toBeChecked()
})

it('shows remove button for each todo', async () => {
  render(<TodosWidget />)
  await screen.findByRole('checkbox', { name: /prep notes/i })
  expect(screen.getByRole('button', { name: /remove prep notes/i })).toBeInTheDocument()
})

it('renders already-done todos as checked', async () => {
  render(<TodosWidget />)
  expect(await screen.findByRole('checkbox', { name: /renew domain/i })).toBeChecked()
})

it('shows error state with retry when provider fails', async () => {
  vi.spyOn(provider, 'getTodos').mockRejectedValueOnce(new Error('down'))
  render(<TodosWidget />)
  expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
})
