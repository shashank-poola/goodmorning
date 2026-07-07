import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import type { CalendarEvent } from '../../data/types'
import styles from './CalendarWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDuration(ms: number): string {
  const totalMin = Math.round(ms / 60_000)
  if (totalMin < 60) return `${totalMin}m`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

interface FreeSlot {
  kind: 'free'
  start: string
  end: string
  durationMs: number
}

interface EventRow {
  kind: 'event'
  event: CalendarEvent
}

type Row = FreeSlot | EventRow

/** Spec §4.1: "day's slots + free time so meetings can be placed without opening 3–4 calendars" */
function buildRows(events: CalendarEvent[], minFreeMs = 30 * 60_000): Row[] {
  const rows: Row[] = []
  for (let i = 0; i < events.length; i++) {
    const e = events[i]!
    rows.push({ kind: 'event', event: e })
    const next = events[i + 1]
    if (next) {
      const gapMs = Date.parse(next.start) - Date.parse(e.end)
      if (gapMs >= minFreeMs) {
        rows.push({ kind: 'free', start: e.end, end: next.start, durationMs: gapMs })
      }
    }
  }
  return rows
}

export function CalendarWidget() {
  const state = useWidgetData(provider.getCalendar)
  return (
    <Panel title="Meetings" accent="gold" id="calendar">
      <WidgetBody {...state} isEmpty={(d) => d.events.length === 0}>
        {({ sources, events }) => {
          const colorOf = (sourceId: string) =>
            sources.find((s) => s.id === sourceId)?.color ?? 'gold'
          const now = Date.now()
          const rows = buildRows(events)

          return (
            <ul className={styles.list}>
              {rows.map((row, i) => {
                if (row.kind === 'free') {
                  return (
                    <li key={`free-${i}`} className={styles.freeSlot}>
                      <span className={styles.time}>{fmt(row.start)}</span>
                      <span className={styles.freeDot} aria-hidden="true" />
                      <span className={styles.freeLabel}>
                        Free · {fmtDuration(row.durationMs)}
                      </span>
                    </li>
                  )
                }

                const e = row.event
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
                        <span className={styles.meta}>{e.location || 'Video call ↗'}</span>
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
