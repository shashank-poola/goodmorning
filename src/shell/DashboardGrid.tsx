import { CalendarWidget } from '../widgets/Calendar/CalendarWidget'
import { EmailsWidget } from '../widgets/Emails/EmailsWidget'
import styles from './DashboardGrid.module.css'

export function DashboardGrid() {
  return (
    <main className={styles.grid}>
      <div className={styles.calendar}>
        <CalendarWidget />
      </div>
      <div className={styles.news} id="news" />
      <div className={styles.tweets} id="tweets" />
      <div className={styles.emails}>
        <EmailsWidget />
      </div>
      <div className={styles.linkedin} id="linkedin" />
      <div className={styles.todos} id="todos" />
      <div className={styles.recap} id="recap" />
      <div className={styles.usage} id="usage" />
      <div className={styles.reminders} id="reminders" />
    </main>
  )
}
