import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './RemindersWidget.module.css'

const ICONS: Record<string, string> = { birthday: '🎂', anniversary: '💍', reminder: '⏰' }

export function daysUntil(iso: string): number {
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function countdown(n: number): string {
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  return `in ${n} days`
}

export function RemindersWidget() {
  const state = useWidgetData(provider.getReminders)
  return (
    <Panel title="Reminders" accent="sage" id="reminders">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(reminders) => (
          <ul className={styles.list}>
            {[...reminders]
              .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
              .map((r) => {
                const n = daysUntil(r.date)
                return (
                  <li key={r.id} className={n === 0 ? styles.today : styles.item}>
                    <span aria-hidden="true">{ICONS[r.type]}</span>
                    <span className={styles.label}>{r.label}</span>
                    <span className={styles.when}>{countdown(n)}</span>
                  </li>
                )
              })}
          </ul>
        )}
      </WidgetBody>
    </Panel>
  )
}
