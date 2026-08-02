# Sprout

**The Living Budget Garden**

Sprout is a personal budgeting app that renders your monthly budget as a garden instead of a spreadsheet. Every category you track is a plant. Every dollar you save waters it. Every dollar you overspend lets weeds creep in. The visuals are never decorative — they're a direct read of the same numbers a normal budgeting app would put in a table, just rendered as something you can feel at a glance instead of something you have to parse.

> *"Keep the garden honest — visuals follow the numbers, never the other way around."*
> — from this project's own engineering guidelines

---

## Contents

- [The idea](#the-idea)
- [A tour of the app](#a-tour-of-the-app)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Testing, linting, and CI](#testing-linting-and-ci)
- [How this project is built](#how-this-project-is-built)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## The idea

Most budgeting apps ask you to read numbers and infer how you're doing. Sprout inverts that: it computes the numbers exactly the same way, then renders the *result* of that math as a living thing, so the state of your budget is something you notice, not something you calculate.

A category's growth stage is a pure function of how much of its budget is spent:

| % of budget spent | Growth stage | What you see |
|---|---|---|
| 0 – 49% | Thriving | Full color, full height, healthy foliage |
| 50 – 84% | Steady | Still healthy, growth starting to slow |
| 85 – 100% | Wilting | Color fading, drooping, running low |
| 100%+ | Overgrown | Weeds moving in around the plant |

Zoom out from one plant to the whole garden and you get the season's overall forecast, shown as a weather banner above the beds:

| Garden state | Weather |
|---|---|
| No categories planted yet | *No forecast yet* |
| Every category thriving or steady | Sunny |
| At least one category wilting | Cloudy |
| At least one category overgrown | Storm |

Every calendar month is a **season**. At the start of a season, categories reset to seedlings; through the month, plants grow or wilt in real time as you log transactions; at the end, the garden is snapshotted into a **harvest record** and a new season begins — either by clicking "Harvest Season" early, or automatically the next time you open the app after the calendar rolls over:

```
   plant a category
          │
          ▼
   log transactions ──────► garden reacts live, weather updates
          │                          │
          ▼                          │
   season ends (calendar        or  you click
   rolls over, caught up               "Harvest Season"
   automatically)                      early
          │                          │
          └───────────┬──────────────┘
                       ▼
              harvest snapshot recorded,
           recurring transactions carried
             forward, categories reset
                       │
                       ▼
                new season begins
```

Savings goals get their own metaphor, growing as trees separate from the everyday garden bed — trunk, branches, and canopy all sized off real contribution progress, sparkling once a goal is fully funded. Debt payoff gets the inverse: a boulder that shrinks toward nothing as you chip away at what's owed.

## A tour of the app

| Route | What it's for |
|---|---|
| `/garden` | The daily landing spot — weather banner, the garden bed, a stat row (budgeted / spent / remaining / goals), a short recent-transactions list, and an Advisor teaser |
| `/transactions` | The full ledger — search, filter by category and date range, sort any column, CSV import |
| `/budget` | Category management, the unallocated pool, and envelope fill / move-money actions |
| `/goals` | Goal trees and debt boulders, each with a contribution/payment history |
| `/reports` | Spending-by-category and budget-vs-spent charts, a season-over-season trend line, and harvest comparisons |
| `/settings` | Data export, account data deletion |

Signed-out visitors land on a public marketing page at `/`; everything above lives behind Clerk authentication under a shared, responsive shell (a sidebar on desktop, a tab bar on mobile).

## Features

<details>
<summary><strong>Living garden & seasons</strong></summary>

- Every `BudgetCategory` renders as a hand-illustrated SVG plant — five species, each with its own growth-stage artwork, driven entirely by real budget math
- A weather banner reflects overall garden health, computed from category state, never hand-set
- Seasons roll over automatically on calendar boundaries (catching up on more than one skipped month if the app wasn't opened in a while) or manually via an early "Harvest Season" action
- Recurring transactions (rent, subscriptions) are carried forward automatically into the new season
- A harvest history records every finished season, with a side-by-side comparison view
</details>

<details>
<summary><strong>Envelope budgeting</strong></summary>

- An unallocated pool that income is added to, then explicitly distributed into category envelopes
- "Move money" transfers a balance between envelopes, or back to unallocated, mid-season
- Each category has an official monthly budget (its baseline) separate from its current effective balance — a mid-season fill doesn't silently become a permanent budget increase; the envelope resets to baseline at the next season boundary
</details>

<details>
<summary><strong>Goals & debt</strong></summary>

- Goal trees grow toward a savings target, with full contribution history
- Debt boulders shrink toward zero as payments are logged, with full payment history
- Either can optionally be funded straight from the unallocated pool
</details>

<details>
<summary><strong>Garden Advisor</strong></summary>

- A server-side route sends an aggregated per-category and per-goal digest (never raw transactions) to an LLM for a handful of short, specific observations
- An "ask" mode answers a free-text question about your season, grounded only in that same digest
- Falls back to notes computed locally, with no model call, if the live Advisor is unavailable or unconfigured — clearly marked as offline output rather than presented as live
- Rate-limited per user
</details>

<details>
<summary><strong>Reports</strong></summary>

- Spending-by-category and budget-vs-spent charts
- A trend line across finished seasons
- Harvest-to-harvest comparison, category by category
</details>

<details>
<summary><strong>Ledger & import</strong></summary>

- Full transaction CRUD with search, category and date-range filters, and column sorting
- CSV import with column-mapping, refund/credit sign handling, and a review step before anything is written
</details>

<details>
<summary><strong>Data & sync</strong></summary>

- Works offline-first against a local copy (Zustand + `localStorage`)
- Syncs to Supabase once signed in, with a debounced save and a visible sync-status indicator
- One-click JSON export of everything Sprout has stored for you
</details>

<details>
<summary><strong>Accounts, safety, and polish</strong></summary>

- Authentication via Clerk, currency auto-detected from the browser and changeable any time
- Destructive actions confirm through a real modal, never an inline toggle
- Reduced-motion respected everywhere Framer Motion is used
- Errors reported to Sentry; a short, deliberately narrow set of product events reported to PostHog with no financial data in the payload
</details>

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict, no `any`) |
| Styling | Tailwind CSS, a small custom design-token layer for the garden palette |
| State | Zustand, persisted locally and synced to a server store once signed in |
| Motion | Framer Motion, gated behind `prefers-reduced-motion` throughout |
| Charts | Recharts |
| Auth | Clerk |
| Database | Supabase (Postgres), one row per account |
| AI | Google Gemini, via the official SDK, called only from server routes |
| Monitoring | Sentry (errors), PostHog (a narrow, non-financial event set) |
| Testing | Vitest |
| Icons | Lucide |

## Getting started

### Prerequisites

- Node.js 22+
- A [Clerk](https://clerk.com) application (required — the app won't run without it)
- A [Supabase](https://supabase.com) project (optional at first; the app runs on a local-only copy until this is configured)
- A [Google AI Studio](https://ai.google.dev) API key (optional; the Garden Advisor works in an offline fallback mode without it)

### Setup

```bash
git clone https://github.com/<your-username>/sprout.git
cd sprout
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your own keys (see the table below), then set up the database:

1. Open your Supabase project's SQL editor
2. Run `supabase/schema.sql`
3. Run each file in `supabase/` that starts with a number, in order, as a migration

Then start the dev server:

```bash
npm run dev
```

<details>
<summary><strong>Environment variables</strong></summary>

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth (client) |
| `CLERK_SECRET_KEY` | Yes | Clerk auth (server) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Defaults to `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Defaults to `/sign-up` |
| `SUPABASE_URL` | For sync | Server-side Supabase persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | For sync | Server-only — never expose to the client |
| `GEMINI_API_KEY` | For live Advisor | Without it, the Advisor runs entirely on its local fallback |
| `GEMINI_MODEL` | No | Defaults to a Gemini flash-lite model |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | No | Error monitoring, server and client |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | No | Needed only for source-map upload at build time |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | No | Product analytics |
| `NEXT_PUBLIC_APP_URL` | No | Used for Open Graph / Twitter card URLs |

Every optional integration degrades gracefully when unset — Sprout is fully usable on a local-only, Advisor-in-fallback-mode basis with only Clerk configured.
</details>

## Project structure

<details>
<summary><strong>Folder layout</strong></summary>

```
app/
  page.tsx                public marketing landing page
  (auth)/                 Clerk sign-in / sign-up
  (app)/                  authenticated shell — shared nav, one sync hook
    layout.tsx
    garden/               daily dashboard
    transactions/         full ledger
    budget/                envelopes & categories
    goals/                 goal trees & debt boulders
    reports/                charts & harvest comparison
    settings/               data export & deletion
  api/
    account/                DELETE — wipes a user's saved garden
    advisor/                 POST — Garden Advisor notes
    advisor/ask/              POST — Garden Advisor free-text Q&A
    garden/                    GET/PUT — Supabase sync
  privacy/ · terms/        public policy pages

components/               reusable UI (PlantIllustration, GoalTree, ConfirmDialog, …)
constants/                 centralized asset/species mapping
data/                      seed data (empty by default — no mock data ships)
hooks/                     useGardenSync, useSignOutRedirect
lib/                       pure logic: garden math, season math, currency, CSV import, …
store/                     the single Zustand store
supabase/                  schema + migrations
types/                     shared TypeScript types
```

`lib/` is deliberately where the real math lives — growth-stage thresholds, season rollover, envelope allocation, and CSV parsing are all pure, fully unit-tested functions with no UI or store dependency.
</details>

## Scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run start           # run a production build
npm run lint              # eslint
npm run type-check         # tsc --noEmit
npm test                     # vitest
```

## Testing, linting, and CI

The `lib/` layer — growth-stage math, season rollover, envelope allocation, CSV import, currency formatting — is covered by Vitest. Every push and pull request against `main` runs lint, typecheck, test, and build, in that order, so a fast failure never waits on a slow one.

## How this project is built

Sprout is developed against a written set of engineering rules the project holds itself to, tracked in-repo alongside the code:

- **Build the smallest useful version first.** A static plant before an animated one; a local-only store before a synced one.
- **Ask before adding a dependency.** Every library in the tech stack above was a deliberate, recorded decision, not a default reach.
- **The garden is never allowed to lie.** Growth stages, weather, and every number on screen are derived from the same budget math a plain spreadsheet would show — the visualization layer is not permitted to distort or hide the real figures.
- **One deliberate change at a time, logged as it lands.** The project keeps a running build log of what shipped, what was flagged as a decision rather than assumed, and what's still open — so picking the project back up doesn't mean re-deriving context from the diff alone.

If you're poking around the source, `SPROUT_INSTRUCTION.md` and the `SPROUT_ROADMAP*.md` files describe this process and the full feature history in detail.

## Roadmap

The core product — garden canvas, seasons, goals, envelope budgeting, the Advisor, Supabase sync, auth, CSV import — is complete and covered by tests. Active work is on deepening the product toward feature parity with established envelope-budgeting apps: a restructured information architecture across dedicated pages, an expanded visual design system, illustrated garden art, and larger features like multi-account tracking and shared budgets. See `SPROUT_ROADMAP_V2.md` for the current punch list.

## Contributing

This is presently a solo-maintained project built in tight iterations. If you'd like to contribute, open an issue describing the change before sending a pull request — the project favors small, focused changes with a clear before/after over broad rewrites, and every new dependency needs a stated reason.

## License

No license has yet been published for this repository. Until one is added, all rights are reserved by the project's author.
