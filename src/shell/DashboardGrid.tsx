import { CalendarWidget } from '../widgets/Calendar/CalendarWidget'
import { EmailsWidget } from '../widgets/Emails/EmailsWidget'
import { LinkedInWidget } from '../widgets/LinkedIn/LinkedInWidget'
import { NewsWidget } from '../widgets/News/NewsWidget'
import { RecapWidget } from '../widgets/Recap/RecapWidget'
import { RemindersWidget } from '../widgets/Reminders/RemindersWidget'
import { TodosWidget } from '../widgets/Todos/TodosWidget'
import { TweetsWidget } from '../widgets/Tweets/TweetsWidget'
import { UsageWidget } from '../widgets/Usage/UsageWidget'
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
      <div className={styles.todos}>
        <TodosWidget />
      </div>
      <div className={styles.recap}>
        <RecapWidget />
      </div>
      <div className={styles.usage}>
        <UsageWidget />
      </div>
      <div className={styles.reminders}>
        <RemindersWidget />
      </div>
    </main>
  )
}
