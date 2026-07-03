import { Sidebar } from './shell/Sidebar'
import { TopBar } from './shell/TopBar'
import { DashboardGrid } from './shell/DashboardGrid'
import { TickerBar } from './shell/TickerBar'
import { ComposeBar } from './shell/ComposeBar'

export function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <DashboardGrid />
      </div>
      <TickerBar />
      <ComposeBar />
    </div>
  )
}
