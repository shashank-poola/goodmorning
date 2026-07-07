import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import { TWEET_FOLLOWS } from '../../data/tweetFollows'
import styles from './TweetsWidget.module.css'

export function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n)
}

function XProfileLinks() {
  return (
    <div className={styles.offline}>
      <p className={styles.offlineMsg}>Feed unavailable — open directly on X:</p>
      <ul className={styles.profileLinks}>
        {TWEET_FOLLOWS.map((handle) => {
          const username = handle.replace(/^@/, '')
          return (
            <li key={handle}>
              <a
                href={`https://x.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.profileLink}
              >
                {handle}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Client-side guard: silently drop any tweet that contains RSS-error text so
 *  stale/hot-reloaded backend responses never surface whitelist errors in the UI. */
const ERROR_FRAGMENTS = [/whitelist/i, /rss.*reader/i, /send an email.*rss/i, /rate.?limit/i]
function isErrorTweet(text: string) {
  return ERROR_FRAGMENTS.some((p) => p.test(text))
}

export function TweetsWidget() {
  const state = useWidgetData(provider.getTweets)
  return (
    <Panel title="Tweets" accent="blue" id="tweets">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0} emptyNode={<XProfileLinks />}>
        {(tweets) => {
          const clean = tweets.filter((t) => !isErrorTweet(t.text))
          if (clean.length === 0) return <XProfileLinks />
          return (
          <ul className={styles.list}>
            {clean.map((t) => (
              <li key={t.id} className={styles.tweet}>
                <span className={styles.avatar} aria-hidden="true">
                  {t.displayName[0]}
                </span>
                <span className={styles.content}>
                  <span className={styles.name}>
                    {t.displayName} <span className={styles.handle}>{t.handle}</span>
                  </span>
                  <span className={styles.text}>{t.text}</span>
                  {t.insight && <span className={styles.insight}>{t.insight}</span>}
                  <span className={styles.engagement}>
                    ♥ <span>{compact(t.likes)}</span> · ⇄ <span>{compact(t.reposts)}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
