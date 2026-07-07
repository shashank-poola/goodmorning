import { useEffect, useState } from 'react'
import {
  Home01Icon,
  DashboardSquare01Icon,
  Mail01Icon,
  Calendar03Icon,
  News01Icon,
  Task01Icon,
  Wallet01Icon,
  Linkedin02Icon,
  NewTwitterIcon,
  Message01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Notification01Icon,
  BookOpen01Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from '@hugeicons/core-free-icons'
import { Icon } from './Icon'
import { ThemeToggle } from './ThemeToggle'
import { scrollToSection } from './commands'
import { useWidgetData } from '../components/useWidgetData'
import { provider } from '../data/providerFactory'
import { useAppTheme } from '../hooks/ThemeContext'
import { useAppAuth } from '../hooks/AuthContext'
import logoUrl from '../assets/logo.png'
import styles from './Sidebar.module.css'

type NavItem = {
  id: string
  label: string
  icon: typeof Home01Icon
  action?: 'finance'
}

type NavGroup = {
  id: string
  label: string
  icon: typeof Home01Icon
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardSquare01Icon,
    items: [
      { id: 'top', label: 'Overview', icon: DashboardSquare01Icon },
      { id: 'gmail', label: 'Messages', icon: Mail01Icon },
      { id: 'calendar', label: 'Calendar', icon: Calendar03Icon },
      { id: 'news', label: 'News', icon: News01Icon },
      { id: 'todos', label: 'To-Do', icon: Task01Icon },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: NewTwitterIcon,
    items: [
      { id: 'linkedin', label: 'LinkedIn', icon: Linkedin02Icon },
      { id: 'tweets', label: 'Tweets', icon: NewTwitterIcon },
      { id: 'emails', label: 'Important Emails', icon: Message01Icon },
    ],
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: Wallet01Icon,
    items: [{ id: 'finance', label: 'Finance', icon: Wallet01Icon, action: 'finance' }],
  },
]

const MOBILE_ITEMS: NavItem[] = [
  { id: 'top', label: 'Overview', icon: DashboardSquare01Icon },
  { id: 'gmail', label: 'Mail', icon: Mail01Icon },
  { id: 'calendar', label: 'Calendar', icon: Calendar03Icon },
  { id: 'news', label: 'News', icon: News01Icon },
  { id: 'finance', label: 'Finance', icon: Wallet01Icon, action: 'finance' },
]

interface Props {
  onOpenFinance: () => void
  activeId: string
  onNavigate: (id: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ onOpenFinance, activeId, onNavigate, collapsed, onToggleCollapse }: Props) {
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>({
    dashboard: true,
    social: true,
    finances: true,
  })
  const [profileOpen, setProfileOpen] = useState(false)

  const { theme, toggle } = useAppTheme()
  const { user, connected, accounts, loading: authLoading, connect } = useAppAuth()

  const displayName = user?.name ?? 'Sign in'
  const displayEmail = user?.email ?? 'Connect Google account'
  const displayInitial = user?.initial ?? '?'

  const { data: renewals } = useWidgetData(provider.getRenewals)
  const notificationCount =
    renewals?.filter((r) => {
      const days = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / 86_400_000)
      return days <= 7
    }).length ?? 0

  useEffect(() => {
    const onScroll = () => {
      if (window.matchMedia('(min-width: 768px)').matches) return

      const sections = ['top', 'calendar', 'gmail', 'linkedin', 'tweets', 'emails', 'news', 'todos']
      const y = window.scrollY + 120
      let current = 'top'
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) current = id
      }
      onNavigate(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onNavigate])

  const go = (item: NavItem) => {
    onNavigate(item.id)
    if (item.action === 'finance') {
      onOpenFinance()
      return
    }
    scrollToSection(item.id)
  }

  const toggleGroup = (id: string) =>
    setGroupExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <nav
      className={styles.sidebar}
      aria-label="Sections"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      {/* ── Header ── */}
      <div className={styles.header}>
        {collapsed ? (
          /* Collapsed: logo visible; hover → show expand toggle */
          <div className={styles.logoWrap} onClick={onToggleCollapse} role="button" tabIndex={0}
            aria-label="Expand sidebar"
            onKeyDown={(e) => e.key === 'Enter' && onToggleCollapse()}>
            <img src={logoUrl} alt="Good Morning" className={styles.logoImg} />
            <span className={styles.collapsedToggle} aria-hidden="true">
              <Icon icon={PanelLeftOpenIcon} size={18} />
            </span>
          </div>
        ) : (
          /* Expanded: logo + name + collapse button */
          <>
            <div className={styles.brand}>
              <img src={logoUrl} alt="Good Morning logo" className={styles.logoImg} />
              <div className={styles.brandText}>
                <span className={styles.brandName}>Good Morning</span>
                <span className={styles.brandSub}>Personal dashboard</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Icon icon={PanelLeftCloseIcon} size={18} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav groups (expanded) ── */}
      {!collapsed &&
        GROUPS.map((group) => {
          const open = groupExpanded[group.id]
          return (
            <div key={group.id} className={styles.group}>
              <button
                type="button"
                className={styles.groupHead}
                onClick={() => toggleGroup(group.id)}
              >
                <span className={styles.groupLeft}>
                  <Icon icon={group.icon} size={18} />
                  <span>{group.label}</span>
                </span>
                <Icon
                  icon={open ? ArrowUp01Icon : ArrowDown01Icon}
                  size={16}
                  className={styles.chevron}
                />
              </button>
              {open && (
                <ul className={styles.groupItems}>
                  {group.items.map((item) => (
                    <li key={item.id + item.label}>
                      <button
                        type="button"
                        className={activeId === item.id ? styles.itemActive : styles.item}
                        onClick={() => go(item)}
                      >
                        <Icon icon={item.icon} size={17} />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}

      {/* ── Collapsed: icon-only items ── */}
      {collapsed &&
        GROUPS.flatMap((g) => g.items).map((item) => (
          <button
            key={item.id + item.label}
            type="button"
            className={activeId === item.id ? styles.iconBtnActive : styles.iconBtn}
            onClick={() => go(item)}
            title={item.label}
          >
            <Icon icon={item.icon} size={18} />
          </button>
        ))}

      {/* ── Spacer ── */}
      <div className={styles.spacer} />

      {/* ── Profile section ── */}
      <div className={styles.profileWrap}>
        {/* Expanded profile menu */}
        {profileOpen && !collapsed && (
          <div className={styles.profileMenu}>
            <div className={styles.menuRow}>
              <span className={styles.menuLabel}>Appearance</span>
              <ThemeToggle theme={theme} onToggle={toggle} />
            </div>

            <button
              type="button"
              className={styles.menuRowBtn}
              onClick={onOpenFinance}
              aria-label="View notifications"
            >
              <span className={styles.menuLeft}>
                <Icon icon={Notification01Icon} size={17} />
                <span className={styles.menuLabel}>Notifications</span>
              </span>
              {notificationCount > 0 && (
                <span className={styles.badge}>{notificationCount}</span>
              )}
            </button>

            {!connected ? (
              <button
                type="button"
                className={styles.menuRowBtn}
                onClick={connect}
                aria-label="Connect Google account"
              >
                <span className={styles.menuLeft}>
                  <Icon icon={Mail01Icon} size={17} />
                  <span className={styles.menuLabel}>Connect Google</span>
                </span>
              </button>
            ) : (
              <>
                {/* Connected accounts list */}
                {accounts.map((acc) => (
                  <div key={acc.id} className={styles.menuRow}>
                    <span className={styles.menuLeft}>
                      <span
                        className={styles.accountDot}
                        data-color={acc.color}
                        aria-hidden="true"
                      />
                      <span className={styles.menuLabel}>{acc.email}</span>
                    </span>
                  </div>
                ))}
                {/* Add another account — re-runs OAuth, backend upserts new token */}
                <button
                  type="button"
                  className={styles.menuRowBtn}
                  onClick={connect}
                  aria-label="Add another Google account"
                >
                  <span className={styles.menuLeft}>
                    <Icon icon={Mail01Icon} size={17} />
                    <span className={styles.menuLabel}>Add Google account</span>
                  </span>
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.menuRowBtn}
              onClick={() => window.open('/README.md', '_blank')}
              aria-label="Documentation"
            >
              <span className={styles.menuLeft}>
                <Icon icon={BookOpen01Icon} size={17} />
                <span className={styles.menuLabel}>Documentation</span>
              </span>
            </button>
          </div>
        )}

        {/* Profile button — full card when expanded, avatar-only when collapsed */}
        <button
          type="button"
          className={styles.profileBtn}
          onClick={() => {
            if (!connected && !authLoading) {
              connect()
              return
            }
            setProfileOpen((v) => !v)
          }}
          aria-expanded={profileOpen}
          title={collapsed ? displayName : undefined}
        >
          <span className={styles.avatar} aria-hidden="true">
            {displayInitial}
          </span>

          {!collapsed && (
            <>
              <span className={styles.profileInfo}>
                <span className={styles.profileName}>{displayName}</span>
                <span className={styles.profileEmail}>{displayEmail}</span>
              </span>
              <Icon
                icon={profileOpen ? ArrowUp01Icon : ArrowDown01Icon}
                size={14}
                className={styles.profileChevron}
              />
            </>
          )}

          {notificationCount > 0 && collapsed && (
            <span
              className={styles.badgeDot}
              aria-label={`${notificationCount} notifications`}
            />
          )}
        </button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className={styles.mobileNav} aria-label="Quick navigation">
        {MOBILE_ITEMS.map((item) => (
          <button
            key={item.id + item.label}
            type="button"
            className={activeId === item.id ? styles.mobileActive : styles.mobileItem}
            onClick={() => go(item)}
            title={item.label}
          >
            <Icon icon={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
