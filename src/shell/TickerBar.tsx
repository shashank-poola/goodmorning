import { useWidgetData } from '../components/useWidgetData'
import { provider } from '../data/providerFactory'
import type { StockQuote } from '../data/types'
import styles from './TickerBar.module.css'

function Item({ s }: { s: StockQuote }) {
  const up = s.changePct >= 0
  return (
    <span className={styles.item}>
      <span className={styles.symbol}>{s.symbol}</span>
      <span className={styles.price}>{s.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      <span className={up ? styles.up : styles.down}>
        {up ? '▲' : '▼'} <span>{up ? '+' : '−'}{Math.abs(s.changePct).toFixed(1)}%</span>
      </span>
    </span>
  )
}

export function TickerBar() {
  const { data, error, retry } = useWidgetData(provider.getStocks)
  if (error) {
    return (
      <div className={styles.ticker}>
        <p className={styles.state}>
          Market data unavailable ·{' '}
          <button type="button" className={styles.retry} onClick={retry}>
            Retry
          </button>
        </p>
      </div>
    )
  }
  if (!data) return <div className={styles.ticker} aria-hidden="true" />
  return (
    <div className={styles.ticker} title="Holdings vs yesterday">
      <div className={styles.track}>
        {data.map((s) => (
          <Item key={s.symbol} s={s} />
        ))}
        {data.map((s) => (
          <Item key={`${s.symbol}-dup`} s={s} />
        ))}
      </div>
    </div>
  )
}
