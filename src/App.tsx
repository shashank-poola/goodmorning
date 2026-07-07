import { useState } from 'react'
import { Sidebar } from './shell/Sidebar'
import { TopBar } from './shell/TopBar'
import { DashboardGrid } from './shell/DashboardGrid'
import { TickerBar } from './shell/TickerBar'
import { ComposeBar } from './shell/ComposeBar'
import { RenewalAlerts } from './shell/RenewalAlerts'
import { FinanceDrawer } from './shell/FinanceDrawer'

export function App() {
  const [financeOpen, setFinanceOpen] = useState(false)
  const openFinance = () => setFinanceOpen(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <RenewalAlerts onOpenFinance={openFinance} />
      <TickerBar />
      <TopBar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar onOpenFinance={openFinance} />
        <DashboardGrid />
      </div>
      <ComposeBar />
      <FinanceDrawer open={financeOpen} onClose={() => setFinanceOpen(false)} />
    </div>
  )
}
