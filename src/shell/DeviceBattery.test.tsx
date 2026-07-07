import { render, screen } from '@testing-library/react'
import { DeviceBattery } from './DeviceBattery'
import { provider } from '../data/providerFactory'

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders a battery ring per connected device with a name tooltip', async () => {
  render(<DeviceBattery />)
  // AirPods Pro is connected @ 82%
  const airpods = await screen.findByRole('listitem', { name: /AirPods Pro: 82% battery/i })
  expect(airpods).toBeInTheDocument()
  expect(screen.getByText('AirPods Pro')).toBeInTheDocument()

  // Only connected devices show — the disconnected Magic Keyboard is excluded.
  const pcts = screen.getAllByTestId('tray-battery')
  expect(pcts.length).toBe(4)
  expect(screen.queryByText('Magic Keyboard')).not.toBeInTheDocument()
})

it('renders nothing while data is loading', () => {
  vi.spyOn(provider, 'getDevices').mockReturnValueOnce(new Promise(() => {}))
  const { container } = render(<DeviceBattery />)
  expect(container).toBeEmptyDOMElement()
})
