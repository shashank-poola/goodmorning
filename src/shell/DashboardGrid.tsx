import { CalendarWidget } from '../widgets/Calendar/CalendarWidget'
import { EmailsWidget } from '../widgets/Emails/EmailsWidget'
import { GmailWidget } from '../widgets/Gmail/GmailWidget'
import { LinkedInWidget } from '../widgets/LinkedIn/LinkedInWidget'
import { NewsWidget } from '../widgets/News/NewsWidget'
import { TodosWidget } from '../widgets/Todos/TodosWidget'
import { TweetsWidget } from '../widgets/Tweets/TweetsWidget'
import styles from './DashboardGrid.module.css'

export function DashboardGrid() {
  return (
    <main className={styles.grid}>
      <div className={styles.calendar}><CalendarWidget /></div>
      <div className={styles.gmail}><GmailWidget /></div>
      <div className={styles.tweets}><TweetsWidget /></div>
      <div className={styles.linkedin}><LinkedInWidget /></div>
      <div className={styles.emails}><EmailsWidget /></div>
      <div className={styles.news}><NewsWidget /></div>
      <div className={styles.todos}><TodosWidget /></div>
    </main>
  )
}
