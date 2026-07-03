# Architecture

React 18 + Vite + TypeScript (strict). No UI framework. CSS Modules +
design tokens.

## Structure

    src/
      data/            # types, DataProvider interface, MockDataProvider, factory
      components/      # useWidgetData hook, Panel + WidgetBody chrome
      shell/           # TopBar, Sidebar, DashboardGrid, TickerBar, ComposeBar
      widgets/<Name>/  # one folder per widget: component + styles + test
      styles/          # tokens.css (design system), global.css

## The data layer (read this before building the backend)

- `src/data/types.ts` — every data shape the UI consumes.
- `src/data/DataProvider.ts` — the contract: one async method per widget.
- `src/data/MockDataProvider.ts` — v1 implementation; realistic data,
  simulated latency, dates computed relative to "today".
- `src/data/providerFactory.ts` — **the swap point.** Exports the singleton
  `provider`. Backend day: implement `ApiDataProvider implements
  DataProvider` and construct it here instead. No widget changes.

Provider methods are arrow-function class properties so they are bound and
referentially stable — widgets pass them straight to `useWidgetData`.

## Widget lifecycle

Every widget follows the same pattern:

    const state = useWidgetData(provider.getX)
    return (
      <Panel title="…" accent="…" id="…">
        <WidgetBody {...state} isEmpty={…}>{(data) => …}</WidgetBody>
      </Panel>
    )

`useWidgetData` provides `{ data, loading, error, retry }`. `WidgetBody`
renders skeleton / error+Retry / empty states uniformly, so a failing API
degrades one widget gracefully — never the page.

**Deliberate exception:** `TopBar`'s quote and the `TickerBar` are shell
components, not `Panel` widgets, so they don't go through `WidgetBody`. The
quote degrades to a static fallback on error (quiet degradation, no retry in
the top bar); the ticker shows a quiet inline error with a Retry button
instead of the skeleton/error pattern above.

## Adding a widget

1. Add the data type to `types.ts`, a method to `DataProvider`, mock data
   to `MockDataProvider`.
2. Create `src/widgets/<Name>/` with component + module.css + test.
3. Add a grid area in `DashboardGrid.module.css` (all three breakpoints)
   and render the widget in `DashboardGrid.tsx`.

## Testing

- Contract tests: `MockDataProvider.test.ts` verifies every method resolves
  with valid, cross-referenced data.
- Widget tests: data rendering + error state (spy on the provider method
  with `vi.spyOn(provider, 'getX').mockRejectedValueOnce(...)`).
- Behavior tests: clock ticking (fake timers), tab switching, todo
  toggling, clipboard copy, marquee duplication.
