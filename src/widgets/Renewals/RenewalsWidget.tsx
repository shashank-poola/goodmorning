import { Globe, Car, ShieldCheck, Repeat, Landmark, FileText, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import { formatMoney, daysUntil, relativeDays } from '../../data/money'
import type { RenewalKind } from '../../data/types'
import styles from './RenewalsWidget.module.css'

const ICONS: Record<RenewalKind, LucideIcon> = {
  domain: Globe,
  mot: Car,
  insurance: ShieldCheck,
  subscription: Repeat,
  tax: Landmark,
  license: FileText,
  other: Bell,
}

/** overdue → past due · soon → within a week · later → beyond. */
function urgencyOf(days: number): 'overdue' | 'soon' | 'later' {
  if (days < 0) return 'overdue'
  if (days <= 7) return 'soon'
  return 'later'
}

export function RenewalsWidget() {
  const state = useWidgetData(provider.getRenewals)
  return (
    <Panel title="Renewals" accent="clay" id="renewals">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(renewals) => {
          const sorted = [...renewals].sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          )
          return (
            <ul className={styles.list}>
              {sorted.map((r) => {
                const Icon = ICONS[r.kind]
                const days = daysUntil(r.dueDate)
                const urgency = urgencyOf(days)
                return (
                  <li key={r.id} className={styles.item}>
                    <span className={styles.icon} aria-hidden="true">
                      <Icon size={17} strokeWidth={1.75} />
                    </span>
                    <span className={styles.details}>
                      <span className={styles.label}>{r.label}</span>
                      <span className={styles.meta}>
                        <span className={styles.entity} data-entity={r.entity}>
                          {r.entity === 'company' ? 'Company' : 'Personal'}
                        </span>
                        {r.amount != null && <span>{formatMoney(r.amount)}</span>}
                      </span>
                    </span>
                    <span
                      className={styles.due}
                      data-urgency={urgency}
                      data-testid="renewal-due"
                    >
                      {relativeDays(days)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
