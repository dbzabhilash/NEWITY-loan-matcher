# Project QA plan

- **Session ID:** `d2f0d400-093d-4349-96ea-fd9b8095e5d2`
- **Started:** 2026-09-30 21:10
- **Last activity:** 2026-09-30 21:15
- **Prompts:** 2

> Tool calls Claude made are listed as 🔧 lines; tool outputs and internal reasoning are omitted.

---

## 🧑 Prompt · 2026-09-30 21:10

> You are free to explore the entire project except for the .docx file. You have access to everything. Do not read the .docx file. 
>
> <pasted_content id="9d57">
> Now, since you have access to everything, I want you to run an analysis on the whole project. Give me the plan for how you would QA this. I can describe in a few bullet points what I was going for, and maybe that helps your decision-making for the plan.
>
> 1. I really prioritized speed and made sure that all the results are going to be instantaneous as soon as you fill out the information on the left pane (that is, the customer-related information).
> 2. I made sure that everything is in a database, even though it's importing a CSV, and that's mostly the entire source of truth. This unlocks a data loop for us that we can leverage further as we iterate on this product.
> 3. I would say that I prioritized the oversight of sales managers, so you can see the different types of actors who are interacting with this tool. There's a network of sales managers, and then there's a network of sales representatives. The sales managers have oversight of what's going on on the overall loan product side and all the sales representatives' side. It gives them the oversight. I thought that was important towards the feedback loop that we are going to create for this product.
> </pasted_content id="9d57">
>
> /caveman


## 🤖 Claude

- 🔧 `Skill` — caveman
- 🔧 `Bash` — List project files and package.json
- 🔧 `Bash` — Read README, context, CSV head, scripts
- 🔧 `Bash` — Read DB, lib, and API source files
- 🔧 `Read` — /Users/abhilashtripathy/.claude/projects/-Users-abhilashtripathy-Developer-Claude-Stuff-NEWITY-NEWITY-loan-matcher/d2f0d400-093d-4349-96ea-fd9b8095e5d2/tool-res
- 🔧 `Read` — /Users/abhilashtripathy/.claude/projects/-Users-abhilashtripathy-Developer-Claude-Stuff-NEWITY-NEWITY-loan-matcher/d2f0d400-093d-4349-96ea-fd9b8095e5d2/tool-res
- 🔧 `Bash` — Size components, read App + MailLink, list tests
- 🔧 `Bash` — Run tests, typecheck, lint

Baseline green: 23/23 tests, tsc + eslint clean. Now reading UI components for risk spots.

- 🔧 `Bash` — Read intake rail, manager app, mail wiring
- 🔧 `Bash` — Check intake fields, manager fetch, mail wiring
- 🔧 `Bash` — Check programs API usage, CSV industries, DB state
- 🔧 `Bash` — Find callers of programs API

Plan below. Read whole repo (skipped `.docx`). Baseline green: 23/23 vitest, `tsc` clean, eslint clean.

## Suspects to check first (from reading the code)

These look like real defects, but I haven't reproduced them yet. Each one maps to one of your three pillars.

| # | Pillar | Suspect | Where |
|---|---|---|---|
| 1 | Data | **Reverting the CSV doesn't revert the app.** Restore an older `lenders.csv` → its hash already exists → returns `"exists"`, no new snapshot. `latestSnapshot` picks max `id`, so the app keeps serving the newer sheet. The CSV stops being the source of truth. | [ingest.ts:46](src/db/ingest.ts:46), [queries.ts:7](src/db/queries.ts:7) |
| 2 | Data loop | **Send log fails silently.** It's a fire-and-forget `fetch` that never checks the response. Expired session (401), 400 or offline → rep still sees "Draft copied", and the row is lost. Double-click → 2 rows. Manager numbers undercount or overcount. | [MailLink.tsx:24](src/components/MailLink.tsx:24) |
| 3 | Rules | **Negative cash flow can't be entered.** `digits()` strips `-`. The `positive_cash_flow` fail and debt ratio ∞ can only trigger at exactly $0. | [IntakeRail.tsx:13](src/components/intake/IntakeRail.tsx:13), [IntakeRail.tsx:291](src/components/intake/IntakeRail.tsx:291) |
| 4 | Data | **Ingest has no validation.** A bad number → `NaN` → NOT NULL error → boot crash. Collateral enum is TS-only, so `"yes"` is stored as-is. A new industry spelling (e.g. `Restaurant / Food Service`) never matches, because `INDUSTRIES` is hardcoded. | [ingest.ts:36](src/db/ingest.ts:36), [intake.ts:96](src/lib/intake.ts:96) |
| 5 | Security | **`/api/programs` needs no login and nothing calls it.** It exposes rep-only thresholds to anyone. Dead endpoint. | [programs/route.ts](src/app/api/programs/route.ts) |
| 6 | Oversight | **Managers can use `/` and log sends.** Their sends show up in "most recommended by", but the rep filter only lists SDRs. | [page.tsx:14](src/app/page.tsx:14), [traction.ts:114](src/db/traction.ts:114) |
| 7 | Oversight | **"Programs with no sends" can go negative.** `programsWithSends` counts across all snapshots; `programsTotal` counts only the latest. | [traction.ts:113](src/db/traction.ts:113) |
| 8 | UX / speed | **Cursor may jump while typing money.** `MoneyInput` reformats on every keystroke, so editing mid-number may move the cursor. Matters on a live call. | [IntakeRail.tsx:31](src/components/intake/IntakeRail.tsx:31) |
| 9 | Data loop | **Long comparison emails may get truncated.** A 4-program comparison `mailto:` body may exceed client limits (~2k chars in Outlook). The clipboard copy is the fallback. | [copy.ts:78](src/lib/copy.ts:78) |
| 10 | Docs | **`context.md` is out of date.** It says intake persists in localStorage (code keeps it in memory only, so the `newity.intake.v2` seed snippet does nothing). It says passwords were seeded in migration 0001 (0002 changed them). It says there are 72 demo sends; the DB has **1**, so the manager view is close to empty. | [context.md](context.md) |

**Product gap, not a bug:** pillar 2 says "everything in DB". That's true for lenders and sends. Intakes, tier at send time and rank position are not stored, so the data loop only sees the final click.

## QA plan by pillar

### 1. Speed
- **Measure:** time `evaluate`+`rank` per keystroke with `performance.now`. Target under 16ms per keystroke with CPU throttled 4× and 6×.
- **Find the limit:** feed synthetic CSVs with 500 and 5,000 rows. It recomputes every program and redraws the whole list on each keystroke, so find where it starts to lag.
- **Check for network calls:** keep the network log open while typing, pasting, clicking Clear and changing presets. Expect zero requests.
- **Offline mid-call:** ranking should keep working, and suspect #2 should become visible.
- **Load time:** time to first meaningful paint on `/` with the server-rendered program list.

### 2. Data / DB as source of truth
- **Lifecycle:**
  - start with `--reset`, then restart: no duplicate snapshot
  - new CSV: snapshot #2 is served
  - **revert the CSV (suspect #1)**
  - `PRAGMA foreign_key_check`
- **Bad CSV files:** unknown phrase (should fail loudly), non-numeric value, BOM, CRLF line endings, quoted commas, missing or extra column, duplicate lender+type, new industry string, lowercase collateral.
- **Migrations:** replay on an empty DB → schema matches `drizzle/meta`.
- **`/api/recommendations` contract** (call handlers directly in vitest, no new deps):
  - 401 without a session
  - 400 for: proposal with 2 programs, comparison with 1, non-integer id, unknown id, blank email
  - duplicate ids collapse
  - blank `customerName` is currently accepted (decide whether that's OK)
- **Traction across snapshots:** sends from snapshot 1 and snapshot 2 merge under one lender+type key.

### 3. Manager oversight
- **Access rules:**
  - signed out → `/login` on both pages
  - SDR → `/manager` redirects to `/`; `/api/traction` returns 403
  - manager → `/api/traction` returns 200
- **Numbers vs hand-written SQL** on a fixed seed: totals, comparisons vs solo, ranking order, **pairs symmetric** (A–B count = B–A count), top 3 reps plus the "N other reps" line, last sent.
- **Filters:**
  - send at 23:30 Central on the last day of the month → lands in that month
  - November (DST change)
  - "All time"; an upcoming month shows the empty state
  - rep filter, and how a manager's own sends appear (suspect #6)
  - "Show all" past 8 programs
- **Full loop E2E** in two browser contexts: SDR sends a proposal and a 3-program comparison → manager refreshes and sees exactly those. Repeat with the SDR's session expired.

### 4. Rule engine (the core the other pillars depend on)
- **Boundary tests per rule:**
  - amount: min, max, min−1, max+1
  - credit: band equal to the floor
  - time in business: 0 / 5 / 6 / 11 / 12 months, 1 yr
  - debt ratio exactly at the cap
  - turnaround exactly at the target
  - injection exactly 10%; ownership exactly 20%; cash flow 0
- **Transitions:**
  - purpose → Real estate shows owner-occupied and recounts the section
  - Refinance makes `no_refi` fail
  - answering an unknown moves potential → strong or ineligible
- **Invariants:** better credit, more years or a lower ratio should never lower a tier. Answering a question should never push strong → potential.
- **Pinned expected results:** add the default Rosa Tacos call next to the existing Marisol fixture.
- **Compare:**
  - limit of 4
  - an ineligible program drops out
  - swap a column, remove one, add again → order stays right
  - the mail kind is `proposal` when only 1 column is left

### 5. Cross-cutting
- Mail on Chrome with no mail client, plus Safari and Firefox clipboard behaviour.
- Widths: phone, tablet, and the `lg` breakpoint where the rail flips.
- Keyboard use for segmented buttons and the stepper.
- Visual pass against the Paper artboards.

## Order

1. Reproduce suspects 1–4 (~30 min, CLI and the browser pane).
2. Rule boundary and invariant tests (vitest).
3. Ingest robustness tests.
4. API contract tests.
5. SDR→manager E2E loop in the browser pane.
6. Performance profiling and stress CSVs.
7. Responsive and visual pass.

Want me to start at step 1 and reproduce the suspects?

---

## 🧑 Prompt · 2026-09-30 21:15

> How about discussing something a little more high-level when we talk about quality assurance?


## 🤖 Claude

## What QA means for this product

QA isn't "does the code run". It's three questions:

1. **Is the answer right?** Would a rep be wrong to trust the ranking?
2. **Does it hold up on a live call?** Is it fast and smooth enough that reps actually use it?
3. **Is the signal true?** Can managers make decisions from what the database records?

Each failure costs something different. Get #1 wrong and you lose customer trust, maybe face compliance trouble. Get #2 wrong and reps quietly stop using the tool. Get #3 wrong and managers make confident decisions from bad data. That gives a priority order: **correctness, then signal, then speed.** You prioritized speed first. Speed is real, but it's the easiest of the three to get right and the cheapest to fix later.

## Pillar by pillar, at a high level

**Speed.** "Instant" should mean *time to a confident answer*, not milliseconds. With 49 programs the math is trivial, so speed is mostly solved. The real question: does the rep know *what to say next*? Open questions, "one answer away" and talk tracks are the actual speed feature. Test that with reps on calls, not with a profiler.

**Database as source of truth.** The quality question is whether you can always say which rate sheet produced a given recommendation. That's provenance. Snapshots give you most of it. The weak spots are ingest (who checks a new CSV before it goes live?) and how a CSV gets rolled back. Quality here is mostly *process*: an owner, a review step, a loud failure.

**Manager oversight / data loop.** This is the riskiest pillar, because it's about whether the numbers mean what they seem to.
- **"Send" ≠ sent.** A row is logged when the rep clicks; actual delivery can't be seen.
- **No outcome.** You know what was recommended, not whether the loan funded. A loop with no result can tell you what's popular, not what's *good*. That's the biggest missing piece for the "data loop" story.
- **Goodhart risk.** Once managers watch send counts, reps optimize for sends. Plan for that before it happens.
- **Surveillance feel.** If SDRs see the tool as monitoring, adoption drops. That's a quality problem too.

## Tensions between the pillars

- **Speed vs data loop.** Matching runs in the browser with no network, so *nothing about the call is captured*: not the intake, not the tier, not where the program ranked. The loop only sees the final click. You chose speed; the cost is a thin data loop.
- **Oversight vs rep trust**, as above.
- **The design mock vs the CSV as truth.** The ranking weights were tuned to reproduce the mock's top 3 for one sample customer. That's fitting to one example, not to what lenders actually approve.

## Who decides what "correct" means

Testing needs a reference for the right answer. Right now:
- **Rule semantics** (e.g. "Requires business plan for startups" treated as a watch item, not a failure) are your interpretation. They need sign-off from someone who knows lending.
- **The mock** has known inconsistencies (bucket counts 19/9/4/5 can't all be produced), so it can't be the final word.
- **Outcome data** would be the real reference, and it doesn't exist yet.

Until someone owns these decisions, tests only prove the code matches *your* reading.

## How I'd frame the QA strategy

| Layer | Question | How |
|---|---|---|
| Verification | Built it right? | Unit tests on rules and money, ingest checks (mostly in place) |
| Validation | Built the right thing? | Shadow 3–5 real SDR calls; have a lending expert review the rule semantics |
| Data integrity | Is the signal true? | Logging that can't silently drop or duplicate; provenance from each send to its snapshot |
| In production | Still true next month? | Ingest alerts, a rate-sheet freshness warning, a check that send volume looks plausible |
| Outcome | Does it help? | Add funded / declined back into the database; compare recommended vs funded |

One-line summary: the code quality is good. The bigger quality risks are **semantic** (who owns the rules), **measurement** (sends with no outcomes) and **adoption** (will reps trust it and use it).

Who is this QA story for: an assessment panel, or a real rollout? That decides whether to lead with validation or with verification.
