import type { Email } from '../../data/types'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './EmailsWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** Important = Gmail IMPORTANT label when present, else unread human senders. */
function importantEmails(emails: Email[]) {
  const flagged = emails.filter((e) => e.important && e.unread)
  if (flagged.length > 0) return flagged
  return emails.filter((e) => e.unread)
}

export function EmailsWidget() {
  const state = useWidgetData(provider.getEmails)
  return (
    <Panel title="Important Emails" accent="clay" id="emails">
      <WidgetBody {...state} isEmpty={(d) => importantEmails(d.emails).length === 0}>
        {({ mailboxes, emails }) => {
          const colorOf = (id: string) => mailboxes.find((m) => m.id === id)?.color ?? 'gold'
          const items = importantEmails(emails)
          return (
            <ul className={styles.list}>
              {items.map((e) => (
                <li key={e.id} className={e.unread ? styles.unread : styles.email}>
                  <span
                    className={styles.dot}
                    data-testid="status-dot"
                    data-status={e.unread ? 'unread' : 'read'}
                    data-account={colorOf(e.mailboxId)}
                    title={e.unread ? 'Unread' : 'Read'}
                  />
                  <span className={styles.content}>
                    <span className={styles.row}>
                      <span className={styles.sender}>{e.sender}</span>
                      <span className={styles.time}>{fmt(e.receivedAt)}</span>
                    </span>
                    <span className={styles.subject}>{e.subject}</span>
                    <span className={styles.preview}>{e.preview}</span>
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
