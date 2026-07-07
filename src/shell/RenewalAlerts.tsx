import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useWidgetData } from '../components/useWidgetData'
import { provider } from '../data/providerFactory'
import { daysUntil, relativeDays } from '../data/money'
import styles from './RenewalAlerts.module.css'

/** A renewal is "immediate" when it's overdue or due within a week. */
const IMMEDIATE_DAYS = 7

interface Props {
  onOpenFinance: () => void
}

/**
 * Floats only urgent renewals to the top of the app as a dismissible banner.
 * Renders nothing while loading, on error, or when nothing is urgent — it only
 * appears when there's something worth interrupting for.
 */
export function RenewalAlerts({ onOpenFinance }: Props) {
  const { data, loading, error } = useWidgetData(provider.getRenewals)
  const [dismissed, setDismissed] = useState(false)

  if (loading || error || !data || dismissed) return null

  const urgent = data
    .filter((r) => daysUntil(r.dueDate) <= IMMEDIATE_DAYS)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  if (urgent.length === 0) return null

  return (
    <div className={styles.bar} role="status" data-testid="renewal-alerts">
      <span className={styles.icon} aria-hidden="true">
        <AlertTriangle size={16} strokeWidth={2} />
      </span>
      <span className={styles.count}>
        {urgent.length} {urgent.length === 1 ? 'reminder' : 'reminders'} need attention
      </span>
      <ul className={styles.items}>
        {urgent.map((r) => {
          const days = daysUntil(r.dueDate)
          return (
            <li key={r.id} className={styles.item}>
              <button type="button" className={styles.chip} onClick={onOpenFinance}>
                <span className={styles.chipLabel}>{r.label}</span>
                <span className={styles.chipDue} data-overdue={days < 0}>
                  {relativeDays(days)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <button type="button" className={styles.view} onClick={onOpenFinance}>
        Open Finance
      </button>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss reminders"
      >
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  )
}
