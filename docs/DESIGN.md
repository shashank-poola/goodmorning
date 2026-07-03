# Design System — "Polar Night Glow"

Aesthetic: northern lights over dark arctic ice. Deep layered blue-blacks
with sparing aurora glow accents. Minimal, editorial, calm — light appears
only where information is alive.

## Palette (tokens in `src/styles/tokens.css`)

| Token | Hex | Role |
|---|---|---|
| `--bg-base` | `#070B12` | Page background — polar night, never pure black |
| `--bg-panel` | `#0D1420` | Widget panels |
| `--bg-raised` | `#121B2B` | Hover surfaces, chips |
| `--border` | `#1A2432` | 1px borders, dividers |
| `--text-primary` | `#E6EDF7` | Primary content |
| `--text-secondary` | `#8B98AC` | Meta, labels, timestamps |
| `--accent-cyan` | `#67E8F9` | Live elements: clock, ticker symbols, active nav |
| `--accent-green` | `#6EE7B7` | Positive: stocks up, done todos, quote accent |
| `--accent-violet` | `#A78BFA` | Social/creative: tweets, LinkedIn, compose |
| `--accent-rose` | `#FDA4AF` | Urgent/negative: stocks down, unread important mail |

### Color theory rationale

An analogous cool-hue family (cyan → green → violet) over a cool dark base
gives harmony without monotony. Rose is the single warm complement,
reserved exclusively for urgency — because it is the only warm hue on the
page, it always reads as "attention" without shouting. Accents run at low
volume (dots, deltas, glows, 2px indicators); surfaces stay neutral.

**Rule: color identifies (source, direction, urgency) — it never decorates.**

Color-coding systems: calendar sources and mailboxes each map to an accent
hue dot; the hue is the identity of the source across the whole page.

## Typography

- UI: Instrument Sans; tabular numerals for clock, stocks, and stats.
- Display: Newsreader light (serif, italic) — the daily quote only. The
  serif-against-dark quote is the page's signature "classy" element.
- Small uppercase labels with 0.1em+ letter-spacing for panel titles.

## Glow & motion rules

- Cyan text-glow on the live clock and ticker symbols only.
- Panels lift with a subtle border-color shift on hover — no shadows.
- Widgets stagger-fade upward on load (~0.5s, 60ms steps).
- Ticker: infinite right-to-left marquee (duplicated track), pauses on hover.
- Everything honors `prefers-reduced-motion: reduce`.

## Layout

Desktop: 4-column CSS grid (calendar column slightly wider), sidebar icon
rail left, ticker + compose bars pinned at the bottom of the document flow.
Tablet: 2 columns. Mobile: 1 column; the sidebar becomes a fixed bottom bar.
Widget bodies scroll internally; the page never scrolls horizontally.
