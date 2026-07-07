import { useCallback, useState } from 'react'
import { Sidebar } from './shell/Sidebar'
import { TopBar } from './shell/TopBar'
import { DashboardGrid } from './shell/DashboardGrid'
import { TickerBar } from './shell/TickerBar'
import { ComposeBar } from './shell/ComposeBar'
import { RenewalAlerts } from './shell/RenewalAlerts'
import { FinanceDrawer } from './shell/FinanceDrawer'
import { CommandPalette } from './shell/CommandPalette'
import { PageHeader } from './shell/PageHeader'
import { useAppTheme } from './hooks/ThemeContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import styles from './App.module.css'

export function App() {
  const [financeOpen, setFinanceOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [activeId, setActiveId] = useState('top')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, toggle } = useAppTheme()

  const openFinance = useCallback(() => setFinanceOpen(true), [])
  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), [])

  useKeyboardShortcuts({
    openCommandPalette: openPalette,
    openFinance,
    toggleTheme: toggle,
    theme,
  })

  return (
    <div className={styles.app}>
      <Sidebar
        onOpenFinance={openFinance}
        activeId={activeId}
        onNavigate={setActiveId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={styles.main}>
        <RenewalAlerts onOpenFinance={openFinance} />
        <TopBar onOpenSearch={openPalette} />
        <TickerBar />
        <div className={styles.content}>
          <PageHeader onOpenFinance={openFinance} />
          <DashboardGrid />
        </div>
        <ComposeBar />
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        theme={theme}
        onToggleTheme={toggle}
        onOpenFinance={openFinance}
      />
      <FinanceDrawer open={financeOpen} onClose={() => setFinanceOpen(false)} />
    </div>
  )
}
