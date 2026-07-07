# Good Morning — Platform Vision & Roadmap

Date: 2026-07-07
Author: Prashant Rathi
Status: Vision / goal document (precedes per-subsystem specs)

---

## 1. The goal

Replace the daily ritual of checking 20 apps across multiple identities with **one
morning command center** that a busy founder/independent-consultant can wake up to
and immediately know: *what my day looks like, what needs my attention, and what I
can act on* — across every email ID, every calendar, and every channel — **without
ever handing my credentials, tokens, or cookies to any automation.**

The product is not "another dashboard." It is a **consolidation + intelligence
layer** over the tools I already use, with a hard privacy constraint and a hard
cost-discipline constraint baked into every design decision.

---

## 2. Where we are today (honest baseline)

- A single-page **React + TypeScript + Vite** dashboard ("Good Morning"), strict
  mode, well-tested (~50+ tests), themed ("Midnight Luxe").
- Widgets already exist for: Calendar, Emails, News, GitHub trending, Tweets,
  LinkedIn, To-dos, Yesterday's Recap, Claude usage, Reminders, Stocks, Device
  battery, Finance/Renewals, and a compose-once bar.
- **Critical architecture fact:** every widget reads from a single interface,
  `DataProvider` (`src/data/DataProvider.ts`), currently wired to
  `MockDataProvider` (hand-written placeholder data). A clean swap point exists in
  `src/data/providerFactory.ts` for a real `ApiDataProvider`.
- File-driven follow lists have been started: `src/data/newsFollows.ts`,
  `tweetFollows.ts`, `stockWatchlist.ts`.

**Implication:** the frontend is a display shell. Everything the user dictated is
about building the **backend / agent layer that fills the `DataProvider` seam with
real, consolidated, intelligent data.** The UI mostly does not need reinventing.

---

## 3. Non-negotiable principles

These override convenience in every subsystem design.

1. **Never share credentials with automation.** No account passwords, API tokens,
   or session cookies are ever handed to a server or third-party automation. The
   only acceptable auth is (a) the user's own OAuth grants (Google), or (b) actions
   that run inside the user's own logged-in session (e.g. a browser extension the
   user drives) — nothing that a server could replay to impersonate the user.
2. **Reuse before reinvent.** Prefer existing, proven solutions (RSS, official
   OAuth APIs, off-the-shelf bots, established orchestration frameworks) over
   building from scratch.
3. **Free before paid.** Always seek a free/open path first; adopt paid APIs only
   when no free path meets the need, and say so explicitly.
4. **Token-cost-aware by design.** Tier the work: cheapest source first (RSS >
   scraping), a cheap/local model (e.g. Ollama or a mini tier) for bulk
   extraction/pre-summary, and a frontier model *only* for final synthesis.
5. **Clean, modular, tested, best-practice structure.** Everything enters the app
   through the `DataProvider` seam. Each subsystem is independently understandable
   and testable, with well-defined interfaces.

---

## 4. Subsystem decomposition

Each row is an independent subsystem with its own future spec → plan → build cycle.
Every subsystem is split into **Build now (public / credential-safe)** and
**Backlog (hard / agentic / futuristic)**, matching how the vision was framed.

### 4.1 Consolidated Calendar
- **Build now:** Google Calendar **read-only OAuth** across multiple Gmail
  accounts → merged into one view, **color-coded by source** account. Shows the
  day's slots + free time so meetings can be placed without opening 3–4 calendars.
- **Backlog:** Private/client calendars that expose no API. Pattern: send a
  **screenshot/photo to a Slack/WhatsApp bot** with a command like
  `update calendar` → a **vision model does OCR + structured extraction** → events
  tagged to a "Client" source and merged into the dashboard.

### 4.2 Consolidated Email
- **Build now:** Gmail **read-only OAuth**, surfacing **primary/important incoming
  messages only** (not notifications/updates), merged across accounts.
- **Backlog:** Private client email with no API access (options to evaluate:
  forwarding rules, IMAP, or manual — undecided; explicitly deferred).

### 4.3 To-dos (with intelligence)
- **Build now:** Manage the list from **Slack/WhatsApp** — `add ...`, `list`,
  `today`. LLM performs **duplicate detection** and **auto-categorization**.
- **Backlog (two agentic tiers the user described):**
  1. **Research/breakdown agent** — e.g. "get the MOT done": the agent finds
     nearby centers, checks reviews/ratings, surfaces contact numbers, proposes the
     booking steps. An **action button** appears on to-dos that are web-researchable.
  2. **Complex/automatable actions** — e.g. "call Shashank for application status":
     a future agent calls using a **cloned voice (ElevenLabs-style)**, references a
     details database, and records a transcript. Explicitly **futuristic; kept as a
     reminder only.**

### 4.4 News
- **Build now:** **File-driven follow list** (`newsFollows.ts`) → **RSS-first**,
  scrape only as fallback → cheap/local model extracts and pre-summarizes → frontier
  model synthesizes the **top few insights per source**. Adding a site to the file
  automatically brings it into the digest.
- **Backlog:** Sites with no feed / paywalled sources.

### 4.5 Tweets / X
- **Build now:** **File-driven follow list** (`tweetFollows.ts`) → best available
  **free-then-paid** source for latest posts → summarized top insights. Adding a
  handle to the file automatically pulls it onto the dashboard.
- **Backlog:** Full engagement analytics.

### 4.6 LinkedIn (strictest privacy constraint)
- **Build now:** **Manual paste** flow — the user copies their post + incoming
  comments/messages, the system generates **reply drafts in the user's writing
  style** into a file for manual copy-paste back onto LinkedIn. **Zero credentials.**
- **Backlog:** A **browser extension running in the user's own logged-in session**
  to read post stats (likes/reshares/comments), followers gained, and incoming
  messages — data read as the user, never via a server-side cookie/token. Message
  reply templates by category. **Third-party tools requiring cookies are rejected.**

---

## 5. Cross-cutting architecture

- **The seam:** all subsystems deliver data through `DataProvider` → a real
  `ApiDataProvider` replaces `MockDataProvider` in `providerFactory.ts`. The first
  subsystem built stands up the **backend skeleton** and this real provider.
- **Messaging command surface:** Slack and/or WhatsApp is the shared control plane
  for calendar photo updates and to-do management — build it once, reuse everywhere.
- **Model tiering:** RSS/API (free, ~0 tokens) → cheap/local model (bulk
  extract/summarize) → frontier model (final synthesis only). Applies to News,
  Tweets, and any future summarization.
- **Orchestration framework decision (deferred to backend-skeleton stage):** start
  with a thin, boring service; adopt an orchestration framework (LangGraph, or
  integrate HERMES / similar) **only when a workflow genuinely needs
  branching/memory** — reuse-first, not framework-first.

---

## 6. Recommended build order

1. **Consolidated Calendar (public)** — anchor of the "know my day" goal; forces the
   backend skeleton + real `ApiDataProvider` into existence.
2. **Consolidated Email (public)** — same OAuth pattern; natural sibling.
3. **News + Tweets engine** — exercises the token-tiering design; lowest credential
   risk.
4. **To-do intelligence + messaging bot** — introduces the reusable Slack/WhatsApp
   command surface.
5. **LinkedIn manual-paste reply generator** — credential-safe engagement help.
6. **Backlog / futuristic:** private calendar & email OCR, research/breakdown agent,
   voice-call agent, LinkedIn browser extension.

*(Order is a recommendation; the user selects the first subsystem to spec.)*

---

## 7. Next step

Pick the first subsystem, brainstorm it into its own spec at
`docs/superpowers/specs/`, then write an implementation plan. This document is the
parent goal every subsystem spec traces back to.
