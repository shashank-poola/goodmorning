import { useEffect, useState } from 'react'
import styles from './PageHeader.module.css'

const DAILY_QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Every morning is a fresh beginning.', author: 'Proverb' },
  { text: 'Do one thing every day that scares you.', author: 'Eleanor Roosevelt' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Your time is limited, so don\'t waste it living someone else\'s life.', author: 'Steve Jobs' },
  { text: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein' },
  { text: 'I have not failed. I\'ve just found 10,000 ways that won\'t work.', author: 'Thomas Edison' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { text: 'The most common way people give up their power is by thinking they don\'t have any.', author: 'Alice Walker' },
  { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford' },
  { text: 'The two most important days in your life are the day you are born and the day you find out why.', author: 'Mark Twain' },
  { text: 'Whatever the mind of man can conceive and believe, it can achieve.', author: 'Napoleon Hill' },
  { text: 'Twenty years from now you will be more disappointed by the things that you didn\'t do.', author: 'Mark Twain' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Spread love everywhere you go. Let no one ever come to you without leaving happier.', author: 'Mother Teresa' },
  { text: 'When you reach the end of your rope, tie a knot in it and hang on.', author: 'Franklin D. Roosevelt' },
  { text: 'Always remember that you are absolutely unique. Just like everyone else.', author: 'Margaret Mead' },
  { text: 'Don\'t go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'You will face many defeats in life, but never let yourself be defeated.', author: 'Maya Angelou' },
  { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela' },
  { text: 'In the end, it\'s not the years in your life that count. It\'s the life in your years.', author: 'Abraham Lincoln' },
  { text: 'Never let the fear of striking out keep you from playing the game.', author: 'Babe Ruth' },
  { text: 'Life is either a daring adventure or nothing at all.', author: 'Helen Keller' },
  { text: 'Many of life\'s failures are people who did not realize how close they were to success when they gave up.', author: 'Thomas Edison' },
]

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - start.getTime()
  const dayOfYear = Math.floor(diff / 86_400_000)
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}

interface Props {
  onOpenFinance: () => void
}

export function PageHeader({ onOpenFinance }: Props) {
  const quote = getDailyQuote()
  const [dayProgress, setDayProgress] = useState(0)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      setDayProgress(Math.round((seconds / 86400) * 100))
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.header} id="top">
      <div className={styles.left}>
        <p className={styles.quote} data-testid="daily-quote">
          <span className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</span>
          <span className={styles.author}> — {quote.author}</span>
        </p>
      </div>
      <div className={styles.right}>
        <span className={styles.progress} aria-label={`Day progress ${dayProgress}%`}>
          {dayProgress}% of day
        </span>
        <button type="button" className={styles.cta} onClick={onOpenFinance}>
          Open Finance
        </button>
      </div>
    </div>
  )
}
