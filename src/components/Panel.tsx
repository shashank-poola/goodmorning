import type { ReactNode } from 'react'
import type { AccentColor } from '../data/types'
import styles from './Panel.module.css'

interface PanelProps {
  title: string
  accent?: AccentColor
  id?: string
  children: ReactNode
}

export function Panel({ title, accent = 'gold', id, children }: PanelProps) {
  return (
    <section className={styles.panel} id={id} data-accent={accent}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

interface WidgetBodyProps<T> {
  data: T | null
  loading: boolean
  error: boolean
  retry: () => void
  isEmpty?: (data: T) => boolean
  /** Custom node shown when isEmpty is true — overrides the default "Nothing here" text. */
  emptyNode?: ReactNode
  children: (data: T) => ReactNode
}

export function WidgetBody<T>({ data, loading, error, retry, isEmpty, emptyNode, children }: WidgetBodyProps<T>) {
  if (loading) {
    return (
      <div className={styles.skeleton} data-testid="skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    )
  }
  if (error || data === null) {
    return (
      <p className={styles.state}>
        Couldn&rsquo;t load.{' '}
        <button type="button" className={styles.retry} onClick={retry}>
          Retry
        </button>
      </p>
    )
  }
  if (isEmpty?.(data)) {
    return emptyNode ? <>{emptyNode}</> : <p className={styles.state}>Nothing here — enjoy the quiet.</p>
  }
  return <>{children(data)}</>
}
