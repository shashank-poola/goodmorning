import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './NewsWidget.module.css'

type Tab = 'tech' | 'world' | 'github'

export function NewsWidget() {
  const [tab, setTab] = useState<Tab>('tech')
  const news = useWidgetData(provider.getNews)
  const repos = useWidgetData(provider.getRepoTrends)

  return (
    <Panel title="News & GitHub" accent="gold" id="news">
      <div className={styles.tabs} role="tablist">
        {(['tech', 'world', 'github'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? styles.tabActive : styles.tab}
            onClick={() => setTab(t)}
          >
            {t === 'github' ? 'GitHub' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'github' ? (
        <WidgetBody {...repos} isEmpty={(d) => d.length === 0}>
          {(list) => (
            <ul className={styles.list}>
              {list.map((r) => (
                <li key={r.id} className={styles.item}>
                  <span className={styles.headline}>{r.name}</span>
                  <span className={styles.meta}>
                    {r.description} · {r.language} · <span className={styles.stars}>+{r.starsToday} ★</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </WidgetBody>
      ) : (
        <WidgetBody {...news} isEmpty={(d) => d.filter((n) => n.category === tab).length === 0}>
          {(list) => (
            <ul className={styles.list}>
              {list
                .filter((n) => n.category === tab)
                .map((n) => (
                  <li key={n.id} className={styles.item}>
                    <span className={styles.headline}>{n.headline}</span>
                    {n.insight ? <span className={styles.insight}>{n.insight}</span> : null}
                    <span className={styles.meta}>
                      {n.source} ·{' '}
                      {new Date(n.publishedAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </WidgetBody>
      )}
    </Panel>
  )
}
