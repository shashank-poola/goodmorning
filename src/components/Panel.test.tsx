import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Panel, WidgetBody } from './Panel'

it('renders title and children', () => {
  render(
    <Panel title="Calendar" accent="cyan" id="calendar">
      <p>body</p>
    </Panel>,
  )
  expect(screen.getByRole('heading', { name: 'Calendar' })).toBeInTheDocument()
  expect(screen.getByText('body')).toBeInTheDocument()
})

it('WidgetBody shows skeleton, error+retry, empty, and data states', async () => {
  const retry = vi.fn()
  const base = { retry, isEmpty: (d: string[]) => d.length === 0 }

  const { rerender } = render(
    <WidgetBody data={null} loading={true} error={false} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  expect(screen.getByTestId('skeleton')).toBeInTheDocument()

  rerender(
    <WidgetBody data={null} loading={false} error={true} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  await userEvent.click(screen.getByRole('button', { name: /retry/i }))
  expect(retry).toHaveBeenCalled()

  rerender(
    <WidgetBody data={[]} loading={false} error={false} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  expect(screen.getByText(/enjoy the quiet/i)).toBeInTheDocument()

  rerender(
    <WidgetBody data={['a', 'b']} loading={false} error={false} {...base}>
      {(d) => <span>{d.join(',')}</span>}
    </WidgetBody>,
  )
  expect(screen.getByText('a,b')).toBeInTheDocument()
})
