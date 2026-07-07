import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './GmailWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function GmailWidget() {
  const state = useWidgetData(provider.getEmails)
  return (
    <Panel title="Gmail" accent="gold" id="gmail">
      <WidgetBody {...state} isEmpty={(d) => d.emails.length === 0}>
        {({ mailboxes, emails }) => {
          const colorOf = (id: string) => mailboxes.find((m) => m.id === id)?.color ?? 'gold'
          const unread = emails.filter((e) => e.unread).length
          return (
            <>
              <p className={styles.summary}>
                <span className={styles.count}>{unread}</span> unread ·{' '}
                <span>{emails.length} in inbox</span>
              </p>
              <ul className={styles.list}>
                {emails.map((e) => (
                  <li key={e.id} className={e.unread ? styles.unread : styles.email}>
                    <span
                      className={styles.dot}
                      data-testid="status-dot"
                      data-status={e.unread ? 'unread' : 'read'}
                      data-account={colorOf(e.mailboxId)}
                      title={e.unread ? 'Unread' : 'Read'}
                    />
                    <span className={styles.sender}>{e.sender}</span>
                    <span className={styles.subject}>{e.subject}</span>
                    <span className={styles.time}>{fmt(e.receivedAt)}</span>
                  </li>
                ))}
              </ul>
            </>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
