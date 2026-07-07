import { useContext } from 'react'
import { ThemeContext } from '../hooks/ThemeContext'
import type { Theme } from '../hooks/useTheme'
import styles from './ThemeToggle.module.css'

interface Props {
  theme?: Theme
  onToggle?: () => void
}

export function ThemeToggle({ theme: themeProp, onToggle: onToggleProp }: Props = {}) {
  const ctx = useContext(ThemeContext)
  const theme = themeProp ?? ctx?.theme ?? 'dark'
  const onToggle = onToggleProp ?? ctx?.toggle ?? (() => {})
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={styles.switch}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={onToggle}
    >
      <span className={styles.track} data-theme={theme}>
        <span className={styles.thumb} />
      </span>
    </button>
  )
}
