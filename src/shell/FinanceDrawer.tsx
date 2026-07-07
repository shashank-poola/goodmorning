import { useEffect } from 'react'
import { X } from 'lucide-react'
import { RenewalsWidget } from '../widgets/Renewals/RenewalsWidget'
import { FinanceWidget } from '../widgets/Finance/FinanceWidget'
import styles from './FinanceDrawer.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Right-hand slide-in panel for the Finance section. Keeps the morning
 * dashboard uncluttered — full renewals list + expenses live here, opened
 * from the sidebar. Content mounts only while open so widgets fetch on demand.
 */
export function FinanceDrawer({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={styles.overlay}
        data-open={open}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={styles.drawer}
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Finance"
        aria-hidden={!open}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>Finance</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close finance"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>
        <div className={styles.body}>
          {open && (
            <>
              <RenewalsWidget />
              <FinanceWidget />
            </>
          )}
        </div>
      </aside>
    </>
  )
}
