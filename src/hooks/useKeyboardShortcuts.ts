import { useEffect } from 'react'
import { buildCommands } from '../shell/commands'
import type { Theme } from './useTheme'

interface Handlers {
  openCommandPalette: () => void
  openFinance: () => void
  toggleTheme: () => void
  theme: Theme
}

export function useKeyboardShortcuts({ openCommandPalette, openFinance, toggleTheme, theme }: Handlers) {
  useEffect(() => {
    const commands = buildCommands({
      scrollTo: (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      openFinance,
      toggleTheme,
      focusCompose: () => document.getElementById('compose-input')?.focus(),
      theme,
    })

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openCommandPalette()
        return
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.shiftKey ? `Shift+${e.key.toUpperCase()}` : e.key.toUpperCase()
      const match = commands.find((cmd) => cmd.shortcut?.toUpperCase() === key)
      if (match) {
        e.preventDefault()
        match.run()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openCommandPalette, openFinance, theme, toggleTheme])
}
