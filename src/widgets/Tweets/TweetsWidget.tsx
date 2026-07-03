import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './TweetsWidget.module.css'

export function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n)
}

export function TweetsWidget() {
  const state = useWidgetData(provider.getTweets)
  return (
    <Panel title="Tweets" accent="violet" id="tweets">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(tweets) => (
          <ul className={styles.list}>
            {tweets.map((t) => (
              <li key={t.id} className={styles.tweet}>
                <span className={styles.avatar} aria-hidden="true">
                  {t.displayName[0]}
                </span>
                <span className={styles.content}>
                  <span className={styles.name}>
                    {t.displayName} <span className={styles.handle}>{t.handle}</span>
                  </span>
                  <span className={styles.text}>{t.text}</span>
                  <span className={styles.engagement}>
                    ♥ <span>{compact(t.likes)}</span> · ⇄ <span>{compact(t.reposts)}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </WidgetBody>
    </Panel>
  )
}
