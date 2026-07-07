import { Menu, LayoutGrid, Mail, Calendar, Newspaper, ListTodo, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './Sidebar.module.css'

// `action: 'finance'` opens the slide-in drawer; everything else scrolls to a
// section by id.
type Item = { id: string; label: string; icon: LucideIcon; action?: 'finance' }

const ITEMS: Item[] = [
  { id: 'top', label: 'Menu', icon: Menu },
  { id: 'top', label: 'Overview', icon: LayoutGrid },
  { id: 'gmail', label: 'Messages', icon: Mail },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'finance', label: 'Finance', icon: Wallet, action: 'finance' },
  { id: 'todos', label: 'To-Do', icon: ListTodo },
]

interface Props {
  onOpenFinance: () => void
}

export function Sidebar({ onOpenFinance }: Props) {
  const go = (item: Item) => {
    if (item.action === 'finance') {
      onOpenFinance()
      return
    }
    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav className={styles.sidebar} aria-label="Sections">
      {ITEMS.map((item, i) => {
        const Icon = item.icon
        return (
          <button
            key={`${item.label}-${i}`}
            type="button"
            className={styles.item}
            onClick={() => go(item)}
            title={item.label}
          >
            <span aria-hidden="true" className={styles.icon}>
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
