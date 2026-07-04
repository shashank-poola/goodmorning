# Design System — "Midnight Luxe"

Aesthetic: a high-end watch face. Warm charcoal surfaces, champagne-gold as
the one "live" hue, and a muted supporting palette that codes information
without shouting. Editorial and quiet — restraint is the luxury.

## Palette (tokens in `src/styles/tokens.css`)

| Token | Hex | Role |
|---|---|---|
| `--bg-base` | `#0F1012` | Page background — warm charcoal, never pure black |
| `--bg-panel` | `#17181B` | Widget panels |
| `--bg-raised` | `#1E1F23` | Hover surfaces, chips |
| `--border` | `#26272B` | Hairline borders, dividers |
| `--text-primary` | `#EDE9E1` | Primary content — warm ivory |
| `--text-secondary` | `#97928A` | Meta, labels, timestamps — warm taupe-gray |
| `--accent-gold` | `#D4B678` | Primary / live: clock, ticker symbols, active nav |
| `--accent-sage` | `#8FA98C` | Positive: stocks up, done todos, quote accent |
| `--accent-blue` | `#7C93A8` | Calm / social: tweets, LinkedIn, compose |
| `--accent-clay` | `#C08457` | Urgent / negative: stocks down, unread important mail |

Two non-color tokens carry the "Luxe" pattern language: `--elevation` (a soft
drop shadow that gives every panel quiet depth) and `--hairline-gold` (the
translucent gold ring that appears on panel hover instead of a hard border).

### Color theory rationale

A warm, muted family — gold, sage, dusty blue, clay — sits over a warm
charcoal base. Gold is the single bright, saturated hue and is spent only on
"live" elements (the ticking clock, ticker symbols, active nav), so the eye
is drawn to what is alive. Sage, blue, and clay are desaturated so they read
as calm labels, not alerts — except clay, the warmest and most saturated of
the three, which is therefore reserved for urgency. Accents run at low volume
(dots, deltas, glows, hairlines); surfaces stay neutral.

**Rule: color identifies (source, direction, urgency) — it never decorates.**

The accent tokens are named for their hue (`gold`/`sage`/`blue`/`clay`) but
assigned by role; `AccentColor` in `src/data/types.ts` is that same set, so a
calendar source or mailbox picks a role-hue that stays consistent everywhere.

## Typography

- UI: Instrument Sans; tabular numerals for clock, stocks, and stats.
- Display: Newsreader light (serif, italic) — the daily quote only. The
  serif-against-charcoal quote is the page's signature "classy" element.
- Small uppercase labels with 0.1em+ letter-spacing for panel titles.

## Glow & motion rules

- Warm gold text-glow on the live clock and ticker symbols only.
- Panels rest on a soft elevation shadow and gain a translucent gold hairline
  ring on hover — a slow (0.45s) settle, no hard color snap.
- Widgets stagger-fade upward on load (~0.5s, 60ms steps).
- Ticker: infinite right-to-left marquee (duplicated track), pauses on hover.
- Everything honors `prefers-reduced-motion: reduce`.

## Layout

Desktop: 4-column CSS grid (calendar column slightly wider), sidebar icon
rail left, ticker + compose bars pinned at the bottom of the document flow.
Tablet: 2 columns. Mobile: 1 column; the sidebar becomes a fixed bottom bar.
Widget bodies scroll internally; the page never scrolls horizontally.
