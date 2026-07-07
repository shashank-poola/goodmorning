import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Icon } from './Icon'
import { buildCommands, filterCommands, scrollToSection, type AppCommand, type CommandSection } from './commands'
import type { Theme } from '../hooks/useTheme'
import styles from './CommandPalette.module.css'

interface Props {
  open: boolean
  onClose: () => void
  theme: Theme
  onToggleTheme: () => void
  onOpenFinance: () => void
}

const SECTION_LABELS: Record<CommandSection, string> = {
  recent: 'Recent',
  navigation: 'Navigation',
  actions: 'Actions',
}

function groupBySection(commands: AppCommand[]) {
  const groups: Array<{ section: CommandSection; items: AppCommand[] }> = []
  const order: CommandSection[] = ['recent', 'navigation', 'actions']
  for (const section of order) {
    const items = commands.filter((cmd) => cmd.section === section)
    if (items.length > 0) groups.push({ section, items })
  }
  return groups
}

export function CommandPalette({ open, onClose, theme, onToggleTheme, onOpenFinance }: Props) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('gm-recent-commands')
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = useMemo(
    () =>
      buildCommands({
        scrollTo: scrollToSection,
        openFinance: () => {
          onOpenFinance()
          onClose()
        },
        toggleTheme: () => {
          onToggleTheme()
          onClose()
        },
        focusCompose: () => {
          document.getElementById('compose-input')?.focus()
          onClose()
        },
        theme,
      }),
    [onClose, onOpenFinance, onToggleTheme, theme],
  )

  const flat = useMemo(() => {
    const base = filterCommands(commands, query)
    if (query.trim()) return base
    const recent = recentIds
      .map((id) => commands.find((cmd) => cmd.id === id))
      .filter((cmd): cmd is AppCommand => Boolean(cmd))
      .map((cmd) => ({ ...cmd, section: 'recent' as const }))
    const rest = base.filter((cmd) => !recentIds.includes(cmd.id))
    return [...recent, ...rest]
  }, [commands, query, recentIds])

  const runCommand = useCallback(
    (cmd: AppCommand) => {
      setRecentIds((prev) => {
        const next = [cmd.id, ...prev.filter((id) => id !== cmd.id)].slice(0, 5)
        try {
          localStorage.setItem('gm-recent-commands', JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
      cmd.run()
      onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    setActiveIndex((i) => (flat.length === 0 ? 0 : Math.min(i, flat.length - 1)))
  }, [flat.length, query])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (flat.length === 0 ? 0 : (i + 1) % flat.length))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length))
        return
      }
      if (e.key === 'Enter' && flat[activeIndex]) {
        e.preventDefault()
        runCommand(flat[activeIndex])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, flat, onClose, open, runCommand])

  if (!open) return null

  const groups = groupBySection(flat)
  let runningIndex = -1

  return (
    <div className={styles.overlay} onClick={onClose} data-testid="command-palette">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.searchRow}>
          <Icon icon={Search01Icon} size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search commands"
          />
          <kbd className={styles.escHint}>Esc</kbd>
        </div>

        <div className={styles.list} role="listbox">
          {groups.length === 0 ? (
            <p className={styles.empty}>No commands found.</p>
          ) : (
            groups.map((group) => (
              <div key={group.section} className={styles.section}>
                <p className={styles.sectionLabel}>{SECTION_LABELS[group.section]}</p>
                {group.items.map((cmd) => {
                  runningIndex += 1
                  const idx = runningIndex
                  const active = idx === activeIndex
                  return (
                    <button
                      key={`${group.section}-${cmd.id}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={active ? styles.itemActive : styles.item}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => runCommand(cmd)}
                    >
                      <span className={styles.itemIcon} aria-hidden="true">
                        <Icon icon={cmd.icon} size={18} />
                      </span>
                      <span className={styles.itemText}>
                        <span className={styles.itemLabel}>{cmd.label}</span>
                        <span className={styles.itemDesc}>{cmd.description}</span>
                      </span>
                      {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
