import { CalendarWidget } from '../widgets/Calendar/CalendarWidget'
import { EmailsWidget } from '../widgets/Emails/EmailsWidget'
import { LinkedInWidget } from '../widgets/LinkedIn/LinkedInWidget'
import { NewsWidget } from '../widgets/News/NewsWidget'
import { TweetsWidget } from '../widgets/Tweets/TweetsWidget'
import styles from './DashboardGrid.module.css'

export function DashboardGrid() {
  return (
    <main className={styles.grid}>
      <div className={styles.calendar}>
        <CalendarWidget />
      </div>
      <div className={styles.news}>
        <NewsWidget />
      </div>
      <div className={styles.tweets}>
        <TweetsWidget />
      </div>
      <div className={styles.emails}>
        <EmailsWidget />
      </div>
      <div className={styles.linkedin}>
        <LinkedInWidget />
      </div>
      <div className={styles.todos} id="todos" />
      <div className={styles.recap} id="recap" />
      <div className={styles.usage} id="usage" />
      <div className={styles.reminders} id="reminders" />
    </main>
  )
}
