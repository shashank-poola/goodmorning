import { useEffect, useState } from 'react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Icon } from './Icon'
import styles from './TopBar.module.css'

const ZONES: Array<{ label: string; tz: string }> = [
  { label: 'IST', tz: 'Asia/Kolkata' },
  { label: 'GMT', tz: 'UTC' },
  { label: 'EST', tz: 'America/New_York' },
]

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.clocks} aria-label="World clocks">
      {ZONES.map((z) => (
        <div key={z.label} className={styles.clock}>
          <span className={styles.zoneLabel}>{z.label}</span>
          <span className={styles.time} data-testid={`clock-${z.label}`}>
            {now.toLocaleTimeString('en-GB', { hour12: false, timeZone: z.tz })}
          </span>
        </div>
      ))}
    </div>
  )
}

interface Props {
  onOpenSearch: () => void
}

export function TopBar({ onOpenSearch }: Props) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.search}
        onClick={onOpenSearch}
        aria-label="Open command palette"
      >
        <Icon icon={Search01Icon} size={17} className={styles.searchIcon} />
        <span className={styles.searchText}>Search</span>
        <kbd className={styles.searchKbd}>Ctrl K</kbd>
      </button>

      <div className={styles.right}>
        <Clock />
      </div>
    </header>
  )
}
