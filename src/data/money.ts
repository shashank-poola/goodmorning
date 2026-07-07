import type { Cadence } from './types'

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** "£214.30" / "£12" — trailing zeros dropped for round amounts. */
export function formatMoney(amount: number): string {
  return gbp.format(amount)
}

/** Whole days from now until an ISO date (negative = overdue). */
export function daysUntil(iso: string): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const due = new Date(iso)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - start.getTime()) / 86_400_000)
}

/** Human "in 4 days" / "today" / "3 days ago" from a day count. */
export function relativeDays(days: number): string {
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days === -1) return 'yesterday'
  if (days < 0) return `${-days} days ago`
  return `in ${days} days`
}

/** Normalise any cadence to a monthly figure so totals are comparable. */
export function monthlyEquivalent(amount: number, cadence: Cadence): number {
  switch (cadence) {
    case 'weekly':
      return (amount * 52) / 12
    case 'yearly':
      return amount / 12
    default:
      return amount
  }
}

export const cadenceLabel: Record<Cadence, string> = {
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
}
