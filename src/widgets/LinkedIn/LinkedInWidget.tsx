import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './LinkedInWidget.module.css'

export function LinkedInWidget() {
  const state = useWidgetData(provider.getLinkedIn)
  return (
    <Panel title="LinkedIn" accent="blue" id="linkedin">
      <WidgetBody {...state}>
        {({ stats, messages }) => (
          <div className={styles.columns}>
            <div className={styles.col}>
              <span className={styles.label}>Followers gained</span>
              <span className={styles.big}>+{stats.followersGainedYesterday}</span>
              <span className={styles.sub}>{stats.followersTotal.toLocaleString('en-US')} total</span>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Yesterday&rsquo;s post</span>
              <span className={styles.postTitle}>{stats.post.title}</span>
              <span className={styles.sub}>
                {stats.post.impressions.toLocaleString('en-US')} impressions · {stats.post.reactions}{' '}
                reactions · {stats.post.comments} comments
              </span>
            </div>
            <div className={styles.colWide}>
              <span className={styles.label}>Messages</span>
              <ul className={styles.messages}>
                {messages.map((m) => (
                  <li key={m.id} className={styles.message}>
                    <span className={styles.from}>{m.from}</span>
                    <span className={styles.preview}>{m.preview}</span>
                    <button
                      className={styles.reply}
                      onClick={() => navigator.clipboard.writeText(m.suggestedReply)}
                      title={m.suggestedReply}
                    >
                      ✦ Copy reply
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </WidgetBody>
    </Panel>
  )
}
