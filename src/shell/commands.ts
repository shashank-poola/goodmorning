import type { IconSvgElement } from '@hugeicons/react'
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
  Sun03Icon,
  Moon02Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons'

export type CommandSection = 'recent' | 'navigation' | 'actions'

export interface AppCommand {
  id: string
  label: string
  description: string
  shortcut?: string
  icon: IconSvgElement
  section: CommandSection
  keywords?: string[]
  run: () => void
}

export interface CommandHandlers {
  scrollTo: (id: string) => void
  openFinance: () => void
  toggleTheme: () => void
  focusCompose: () => void
  theme: 'light' | 'dark'
}

export function buildCommands(handlers: CommandHandlers): AppCommand[] {
  const { scrollTo, openFinance, toggleTheme, focusCompose, theme } = handlers

  return [
    {
      id: 'home',
      label: 'Go to Home',
      description: 'Navigate to the dashboard overview',
      shortcut: 'H',
      icon: Home01Icon,
      section: 'navigation',
      keywords: ['overview', 'today', 'dashboard'],
      run: () => scrollTo('top'),
    },
    {
      id: 'calendar',
      label: 'Go to Calendar',
      description: 'Open meetings and schedule',
      shortcut: 'C',
      icon: Calendar03Icon,
      section: 'navigation',
      keywords: ['meetings', 'schedule'],
      run: () => scrollTo('calendar'),
    },
    {
      id: 'gmail',
      label: 'Go to Gmail',
      description: 'Browse inbox messages',
      shortcut: 'G',
      icon: Mail01Icon,
      section: 'navigation',
      keywords: ['mail', 'messages', 'inbox'],
      run: () => scrollTo('gmail'),
    },
    {
      id: 'emails',
      label: 'Go to Important Emails',
      description: 'View flagged messages across mailboxes',
      shortcut: 'E',
      icon: Message01Icon,
      section: 'navigation',
      keywords: ['important', 'mailbox'],
      run: () => scrollTo('emails'),
    },
    {
      id: 'news',
      label: 'Go to News',
      description: 'Read news and GitHub updates',
      shortcut: 'N',
      icon: News01Icon,
      section: 'navigation',
      keywords: ['github', 'headlines'],
      run: () => scrollTo('news'),
    },
    {
      id: 'tweets',
      label: 'Go to Tweets',
      description: 'See posts from followed accounts',
      shortcut: 'T',
      icon: NewTwitterIcon,
      section: 'navigation',
      keywords: ['x', 'twitter', 'social'],
      run: () => scrollTo('tweets'),
    },
    {
      id: 'linkedin',
      label: 'Go to LinkedIn',
      description: 'Check your LinkedIn feed',
      shortcut: 'L',
      icon: Linkedin02Icon,
      section: 'navigation',
      keywords: ['social', 'feed'],
      run: () => scrollTo('linkedin'),
    },
    {
      id: 'todos',
      label: 'Go to To-Do',
      description: 'Manage tasks for today',
      shortcut: 'D',
      icon: Task01Icon,
      section: 'navigation',
      keywords: ['tasks', 'todo'],
      run: () => scrollTo('todos'),
    },
    {
      id: 'finance',
      label: 'Open Finance',
      description: 'View accounts, renewals, and spending',
      shortcut: 'F',
      icon: Wallet01Icon,
      section: 'actions',
      keywords: ['money', 'wallet', 'renewals'],
      run: openFinance,
    },
    {
      id: 'compose',
      label: 'Focus Compose Bar',
      description: 'Write once, post everywhere',
      shortcut: '/',
      icon: DashboardSquare01Icon,
      section: 'actions',
      keywords: ['write', 'post', 'draft'],
      run: focusCompose,
    },
    {
      id: 'theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle the application theme',
      shortcut: 'Shift+T',
      icon: theme === 'dark' ? Sun03Icon : Moon02Icon,
      section: 'actions',
      keywords: ['theme', 'dark', 'light', 'appearance'],
      run: toggleTheme,
    },
    {
      id: 'docs',
      label: 'View Documentation',
      description: 'Open project README in browser',
      shortcut: 'Shift+D',
      icon: BookOpen01Icon,
      section: 'actions',
      keywords: ['help', 'readme', 'guide'],
      run: () => window.open('/README.md', '_blank'),
    },
  ]
}

export function filterCommands(commands: AppCommand[], query: string): AppCommand[] {
  const q = query.trim().toLowerCase()
  if (!q) return commands
  return commands.filter((cmd) => {
    const haystack = [cmd.label, cmd.description, ...(cmd.keywords ?? [])].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}

export function scrollToSection(id: string) {
  // Desktop bento fits all widgets — scrolling hides sections behind overflow:hidden.
  if (window.matchMedia('(min-width: 768px)').matches) {
    if (id === 'top') {
      document.querySelector<HTMLElement>('[data-dashboard-scroll]')?.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
