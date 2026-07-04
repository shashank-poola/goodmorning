import { useEffect, useState } from 'react'
import { provider } from '../data/providerFactory'
import { useWidgetData } from '../components/useWidgetData'
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

  const date = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <div className={styles.clockWrap}>
      <span className={styles.date}>{date}</span>
      <div className={styles.clocks}>
        {ZONES.map((z) => (
          <div key={z.label} className={styles.clock}>
            <span className={styles.zoneLabel}>{z.label}</span>
            <span className={styles.time} data-testid={`clock-${z.label}`}>
              {now.toLocaleTimeString('en-GB', { hour12: false, timeZone: z.tz })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const FALLBACK_QUOTE = {
  text: 'Every morning is a fresh beginning.',
  author: 'Proverb',
}

export function TopBar() {
  const { data, error } = useWidgetData(provider.getQuote)
  const quote = data ?? (error ? FALLBACK_QUOTE : null)
  return (
    <header className={styles.topbar} id="top">
      <p className={styles.quote}>
        {quote ? (
          <>
            <span className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</span>
            <span className={styles.author}> — {quote.author}</span>
          </>
        ) : (
          <span className={styles.quoteText}>&nbsp;</span>
        )}
      </p>
      <Clock />
    </header>
  )
}
