import styles from './Sidebar.module.css'

const ITEMS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'top', label: 'Overview', icon: '◆' },
  { id: 'emails', label: 'Messages', icon: '✉' },
  { id: 'calendar', label: 'Calendar', icon: '▦' },
  { id: 'news', label: 'News', icon: '☰' },
  { id: 'todos', label: 'To-Do', icon: '✓' },
]

export function Sidebar() {
  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav className={styles.sidebar} aria-label="Sections">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={styles.item}
          onClick={() => go(item.id)}
          title={item.label}
        >
          <span aria-hidden="true" className={styles.icon}>
            {item.icon}
          </span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
