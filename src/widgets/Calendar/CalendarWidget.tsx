import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './CalendarWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function CalendarWidget() {
  const state = useWidgetData(provider.getCalendar)
  return (
    <Panel title="Today" accent="cyan" id="calendar">
      <WidgetBody {...state} isEmpty={(d) => d.events.length === 0}>
        {({ sources, events }) => {
          const colorOf = (sourceId: string) =>
            sources.find((s) => s.id === sourceId)?.color ?? 'cyan'
          const now = Date.now()
          return (
            <ul className={styles.list}>
              {events.map((e) => {
                const past = new Date(e.end).getTime() < now
                return (
                  <li key={e.id} className={past ? styles.past : styles.event}>
                    <span className={styles.time}>{fmt(e.start)}</span>
                    <span
                      className={styles.dot}
                      data-testid="source-dot"
                      data-color={colorOf(e.sourceId)}
                    />
                    <span className={styles.details}>
                      <span className={styles.title}>{e.title}</span>
                      {(e.location || e.meetLink) && (
                        <span className={styles.meta}>{e.location ?? 'Video call ↗'}</span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
