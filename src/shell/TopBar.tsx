import { useEffect, useState } from 'react'
import { provider } from '../data/providerFactory'
import { useWidgetData } from '../components/useWidgetData'
import styles from './TopBar.module.css'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('en-GB', { hour12: false })
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={styles.clockWrap}>
      <span className={styles.date}>{date}</span>
      <span className={styles.time} data-testid="clock">
        {time}
      </span>
    </div>
  )
}

export function TopBar() {
  const { data } = useWidgetData(provider.getQuote)
  return (
    <header className={styles.topbar} id="top">
      <p className={styles.quote}>
        {data ? (
          <>
            <span className={styles.quoteText}>&ldquo;{data.text}&rdquo;</span>
            <span className={styles.author}> — {data.author}</span>
          </>
        ) : (
          <span className={styles.quoteText}>&nbsp;</span>
        )}
      </p>
      <Clock />
    </header>
  )
}
