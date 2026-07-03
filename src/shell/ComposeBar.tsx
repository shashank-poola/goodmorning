import { useState } from 'react'
import styles from './ComposeBar.module.css'

const PLATFORMS = ['LinkedIn', 'X', 'Substack', 'Newsletter'] as const

export function ComposeBar() {
  const [active, setActive] = useState<Set<string>>(new Set(PLATFORMS))
  const [text, setText] = useState('')

  const toggle = (p: string) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  return (
    <div className={styles.compose}>
      <textarea
        className={styles.input}
        rows={1}
        placeholder="Write once, post everywhere…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={styles.chips}>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            className={active.has(p) ? styles.chipActive : styles.chip}
            aria-pressed={active.has(p)}
            onClick={() => toggle(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <button type="button" className={styles.post} disabled title="Connects when backend lands">
        Post
      </button>
    </div>
  )
}
