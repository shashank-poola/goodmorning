# Finance & Renewals — design

Date: 2026-07-06
Branch: feature/theme-midnight-luxe

## Revision (2026-07-06) — off-dashboard

Per follow-up: the dashboard grid stays uncluttered. Finance and the full
Renewals list are **not** shown on the grid. Instead:

- **Top notification banner** (`src/shell/RenewalAlerts.tsx`): floats only
  *immediate* renewals (overdue or due within 7 days) to the very top of the app
  as a dismissible bar with per-item chips + an "Open Finance" button. Renders
  nothing while loading, on error, or when nothing is urgent.
- **Slide-in Finance drawer** (`src/shell/FinanceDrawer.tsx`): the sidebar
  **Finance** item (and the banner) opens a right-hand drawer containing the full
  **Renewals** list and the **Finance** section (reusing `RenewalsWidget` and
  `FinanceWidget` unchanged). Closes via ✕, backdrop click, or Escape.
- The standalone **Renewals** sidebar item was removed (it lives in the banner +
  drawer now). `App` holds the `financeOpen` state.

The sections below describe the two widgets, which are unchanged — only their
mount point moved from the grid into the drawer.

## Goal

Track expenses (personal and company), recurring commitments, and time-sensitive
renewals (domain, car MOT, insurance), and always know **which account** paid for
each item. Renewals stay glanceable on the dashboard; the heavier expense/account
detail lives in a dedicated Finance section.

## What shipped

Two new widgets, wired through the existing `DataProvider` contract (mock now,
real backend later — same swap point as every other widget).

### 1. Renewals widget (dashboard glance) — `src/widgets/Renewals/`
- Backed by `provider.getRenewals(): Promise<Renewal[]>`.
- Upcoming renewals sorted soonest-first, each with: kind icon (domain / MOT /
  insurance / subscription / tax / licence / other), label, a Personal/Company
  tag, optional amount, and a relative due countdown ("in 4 days", "tomorrow",
  "yesterday").
- Urgency colouring on the due label: overdue = clay/red, within 7 days = gold,
  later = muted.
- Distinct from the pre-existing **Reminders** widget (birthdays/anniversaries),
  which is left untouched.

### 2. Finance section (dedicated) — `src/widgets/Finance/`
- Backed by `provider.getFinance(): Promise<FinanceData>` returning
  `{ accounts, recurring, expenses }`.
- Full-width section on the dashboard, reachable from the new **Finance** sidebar
  item (Wallet icon) via scroll — consistent with how the sidebar already works.
- **All / Personal / Company** segmented filter (client-side).
- Summary strip: monthly-normalised committed total (`/mo committed`) and recent
  one-off spend, both respecting the active filter.
- Two columns: **Recurring commitments** (name · cadence · next charge · amount ·
  paid-from account) and **Recent expenses** (description · date · amount ·
  paid-from account).
- Every row shows a "paid from" account chip (coloured dot + account name).

## Data model (`src/data/types.ts`)

- `Entity = 'personal' | 'company'`
- `Cadence = 'weekly' | 'monthly' | 'yearly'`
- `ExpenseCategory` (software, subscription, insurance, domain, vehicle, tax,
  utilities, office, health, travel, other)
- `Account { id, name, entity, last4?, color }`
- `RecurringExpense { id, name, amount, cadence, nextChargeDate, accountId, entity, category }`
- `Expense { id, description, amount, date, accountId, entity, category }`
- `RenewalKind` + `Renewal { id, label, kind, dueDate, entity, amount?, accountId? }`
- `FinanceData { accounts, recurring, expenses }`

Currency: GBP (£), matching the UK/MOT context. Shared formatting/date helpers in
`src/data/money.ts` (`formatMoney`, `daysUntil`, `relativeDays`,
`monthlyEquivalent`, `cadenceLabel`).

## Wiring

- `DataProvider` gains `getRenewals()` and `getFinance()`; `MockDataProvider`
  implements both with representative sample data (accounts: Amex Business, HSBC
  Business, Monzo Personal, Amex Personal).
- `DashboardGrid` adds a third grid row: `renewals` (1 col) + `finance` (3 cols),
  with responsive fallbacks at 1199px and 767px.
- `Sidebar` adds **Renewals** (BellRing) and **Finance** (Wallet) items.

## Verification

- `tsc --noEmit` clean, `npm run build` clean.
- 53/53 tests pass, including new Renewals (3) and Finance (4) suites covering
  render, entity filtering, and error/retry states.
- Visually verified in-browser: sections render, no console errors, Company filter
  correctly hides personal items.

## Future (out of scope for this pass)

- Real backend via `ApiDataProvider` (the whole point of the provider contract).
- Add/edit/delete expenses and accounts (currently read-only).
- Account balances (accounts are labels/funding sources, not balances).
