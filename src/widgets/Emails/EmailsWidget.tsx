import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './EmailsWidget.module.css'

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function EmailsWidget() {
  const state = useWidgetData(provider.getEmails)
  return (
    <Panel title="Important Emails" accent="clay" id="emails">
      <WidgetBody {...state} isEmpty={(d) => d.emails.filter((e) => e.unread).length === 0}>
        {({ mailboxes, emails }) => {
          const colorOf = (id: string) => mailboxes.find((m) => m.id === id)?.color ?? 'gold'
          const important = emails.filter((e) => e.unread)
          return (
            <ul className={styles.list}>
              {important.map((e) => (
                <li key={e.id} className={e.unread ? styles.unread : styles.email}>
                  <span className={styles.dot} data-testid="mailbox-dot" data-color={colorOf(e.mailboxId)} />
                  <span className={styles.content}>
                    <span className={styles.row}>
                      <span className={styles.sender}>{e.sender}</span>
                      <span className={styles.time}>{fmt(e.receivedAt)}</span>
                    </span>
                    <span className={styles.subject}>
                      {e.subject}
                      {e.unread && <span className={styles.unreadDot} data-testid="unread-dot" />}
                    </span>
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
