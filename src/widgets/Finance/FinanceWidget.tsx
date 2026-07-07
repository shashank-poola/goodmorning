import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import { formatMoney, monthlyEquivalent, cadenceLabel, daysUntil, relativeDays } from '../../data/money'
import type { Account, Entity, FinanceData } from '../../data/types'
import styles from './FinanceWidget.module.css'

type Filter = Entity | 'all'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'personal', label: 'Personal' },
  { id: 'company', label: 'Company' },
]

const keep = <T extends { entity: Entity }>(items: T[], f: Filter): T[] =>
  f === 'all' ? items : items.filter((i) => i.entity === f)

/** Small "paid from" chip that resolves an accountId to its name + colour. */
function AccountChip({ accounts, id }: { accounts: Account[]; id: string }) {
  const account = accounts.find((a) => a.id === id)
  if (!account) return null
  return (
    <span className={styles.account} title={account.last4 ? `•••• ${account.last4}` : account.name}>
      <span className={styles.accountDot} data-color={account.color} />
      {account.name}
    </span>
  )
}

export function FinanceWidget() {
  const state = useWidgetData(provider.getFinance)
  const [filter, setFilter] = useState<Filter>('all')

  return (
    <Panel title="Finance" accent="gold" id="finance">
      <WidgetBody {...state}>
        {(data: FinanceData) => {
          const recurring = keep(data.recurring, filter).sort(
            (a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime(),
          )
          const expenses = keep(data.expenses, filter).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          const committed = recurring.reduce(
            (sum, r) => sum + monthlyEquivalent(r.amount, r.cadence),
            0,
          )
          const recentSpend = expenses.reduce((sum, e) => sum + e.amount, 0)

          return (
            <div className={styles.wrap}>
              <div className={styles.toolbar}>
                <div className={styles.segmented} role="group" aria-label="Filter finances">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={styles.segment}
                      data-active={filter === f.id}
                      aria-pressed={filter === f.id}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className={styles.summary}>
                  <span className={styles.stat}>
                    <span className={styles.statValue}>{formatMoney(committed)}</span>
                    <span className={styles.statLabel}>/mo committed</span>
                  </span>
                  <span className={styles.stat}>
                    <span className={styles.statValue}>{formatMoney(recentSpend)}</span>
                    <span className={styles.statLabel}>recent spend</span>
                  </span>
                </div>
              </div>

              <div className={styles.columns}>
                <section className={styles.column}>
                  <h3 className={styles.colTitle}>Recurring commitments</h3>
                  {recurring.length === 0 ? (
                    <p className={styles.empty}>None here.</p>
                  ) : (
                    <ul className={styles.list}>
                      {recurring.map((r) => (
                        <li key={r.id} className={styles.row}>
                          <span className={styles.rowMain}>
                            <span className={styles.rowName}>{r.name}</span>
                            <span className={styles.rowSub}>
                              {cadenceLabel[r.cadence]} · next {relativeDays(daysUntil(r.nextChargeDate))}
                            </span>
                            <AccountChip accounts={data.accounts} id={r.accountId} />
                          </span>
                          <span className={styles.amount}>
                            {formatMoney(r.amount)}
                            <span className={styles.per}>/{r.cadence === 'yearly' ? 'yr' : r.cadence === 'weekly' ? 'wk' : 'mo'}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className={styles.column}>
                  <h3 className={styles.colTitle}>Recent expenses</h3>
                  {expenses.length === 0 ? (
                    <p className={styles.empty}>None here.</p>
                  ) : (
                    <ul className={styles.list}>
                      {expenses.map((e) => (
                        <li key={e.id} className={styles.row}>
                          <span className={styles.rowMain}>
                            <span className={styles.rowName}>{e.description}</span>
                            <span className={styles.rowSub}>
                              {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                            <AccountChip accounts={data.accounts} id={e.accountId} />
                          </span>
                          <span className={styles.amount}>{formatMoney(e.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          )
        }}
      </WidgetBody>
    </Panel>
  )
}
