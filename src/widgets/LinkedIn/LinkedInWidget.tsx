import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './LinkedInWidget.module.css'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

/** Spec §4.6: "drafts into a file for manual copy-paste back onto LinkedIn" */
function downloadDrafts(drafts: string[]): void {
  const ts = new Date().toISOString().slice(0, 10)
  const body = drafts.map((d, i) => `--- Reply ${i + 1} ---\n${d}`).join('\n\n')
  const blob = new Blob([body], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `linkedin-reply-drafts-${ts}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

async function generateReplies(text: string): Promise<string[]> {
  const res = await fetch(`${apiBase}/api/linkedin/paste`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Failed to generate replies')
  const body = (await res.json()) as { drafts: string[] }
  return body.drafts
}

function PasteSection() {
  const [open, setOpen] = useState(false)
  const [pasted, setPasted] = useState('')
  const [drafts, setDrafts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!pasted.trim()) return
    setLoading(true)
    try {
      const replies = await generateReplies(pasted)
      setDrafts(replies)
    } catch {
      setDrafts(['Could not generate — check your API key.'])
    } finally {
      setLoading(false)
    }
  }

  const copyDraft = (text: string, idx: number) => {
    void navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <div className={styles.paste}>
      <button
        type="button"
        className={styles.pasteToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? '▾' : '▸'} Generate reply drafts
      </button>

      {open && (
        <div className={styles.pasteBody}>
          <textarea
            className={styles.pasteInput}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste your LinkedIn post + comments here…"
            rows={4}
          />
          <button
            type="button"
            className={styles.pasteBtn}
            onClick={() => void handleGenerate()}
            disabled={!pasted.trim() || loading}
          >
            {loading ? 'Generating…' : 'Generate drafts'}
          </button>

          {drafts.length > 0 && (
            <>
              <button
                type="button"
                className={styles.downloadBtn}
                onClick={() => downloadDrafts(drafts)}
                title="Download all drafts as a text file"
              >
                ↓ Download all drafts
              </button>
              <ul className={styles.drafts}>
                {drafts.map((draft, i) => (
                  <li key={i} className={styles.draft}>
                    <span className={styles.draftText}>{draft}</span>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => copyDraft(draft, i)}
                    >
                      {copied === i ? '✓ Copied' : '✦ Copy'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function LinkedInWidget() {
  const state = useWidgetData(provider.getLinkedIn)
  return (
    <Panel title="LinkedIn" accent="blue" id="linkedin">
      <WidgetBody {...state}>
        {({ stats, messages }) => (
          <div className={styles.columns}>
            <div className={styles.col}>
              <span className={styles.label}>Followers gained</span>
              <span className={styles.big}>+{stats.followersGainedYesterday}</span>
              <span className={styles.sub}>{stats.followersTotal.toLocaleString('en-US')} total</span>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Yesterday&rsquo;s post</span>
              <span className={styles.postTitle}>{stats.post.title}</span>
              <span className={styles.sub}>
                {stats.post.impressions.toLocaleString('en-US')} impressions · {stats.post.reactions}{' '}
                reactions · {stats.post.comments} comments
              </span>
            </div>
            <div className={styles.colWide}>
              <span className={styles.label}>Messages</span>
              <ul className={styles.messages}>
                {messages.map((m) => (
                  <li key={m.id} className={styles.message}>
                    <span className={styles.from}>{m.from}</span>
                    <span className={styles.preview}>{m.preview}</span>
                    <button
                      className={styles.reply}
                      onClick={() => navigator.clipboard.writeText(m.suggestedReply)}
                      title={m.suggestedReply}
                    >
                      ✦ Copy reply
                    </button>
                  </li>
                ))}
              </ul>
              <PasteSection />
            </div>
          </div>
        )}
      </WidgetBody>
    </Panel>
  )
}
