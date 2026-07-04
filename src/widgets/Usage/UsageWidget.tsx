import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './UsageWidget.module.css'

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return String(n)
}

export function UsageWidget() {
  const state = useWidgetData(provider.getUsageStats)
  return (
    <Panel title="Claude Code Usage" accent="gold" id="usage">
      <WidgetBody {...state}>
        {({ yesterday, dayBefore }) => {
          const max = Math.max(yesterday.tokens, dayBefore.tokens)
          return (
            <div className={styles.wrap}>
              <div className={styles.headline}>
                <span className={styles.big} data-testid="usage-total">
                  {fmtTokens(yesterday.tokens)}
                </span>
                <span className={styles.sub}>
                  tokens · {yesterday.sessions} sessions · <span>${yesterday.costUsd.toFixed(2)}</span>
                </span>
              </div>
              <div className={styles.chart}>
                {[
                  { label: 'Yesterday', day: yesterday },
                  { label: 'Day before', day: dayBefore },
                ].map(({ label, day }) => (
                  <div key={label} className={styles.row}>
                    <span className={styles.rowLabel}>{label}</span>
                    <span className={styles.barTrack}>
                      <span
                        className={styles.bar}
                        data-testid="usage-bar"
                        style={{ width: `${(day.tokens / max) * 100}%` }}
                      />
                    </span>
                    <span className={styles.rowValue}>{fmtTokens(day.tokens)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
