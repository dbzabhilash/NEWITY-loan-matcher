# Newity Loan Matcher — context

Living record of the logic and design decisions behind the app. Update this when a decision changes. Mechanics (how to run, file layout) live in `README.md`; this file is the *why* and the *rules*.

## 1. What the tool is

A sales-rep screen used live on a phone call. The rep fills a short intake rail on the left; the right side ranks every lender program from the CSV as **strong / potential / poor / ineligible** and re-ranks on every keystroke. From the ranked list the rep can open a program (talk track, why-it-fits, watch items, rep-only thresholds), compare three programs side by side, and model affordability with a payment slider. Output to the customer is an email draft (`mailto:`), never an application.

Sources of truth: `data/lenders.csv` and the Paper design file "Newity Loan Matcher" (three artboards: Live call, Compare top 3, Compare + affordability). The `.docx` in the folder is **not** a source.

## 2. Architecture decisions

| Decision | Choice | Why |
|---|---|---|
| Stack | Next.js (App Router) + TypeScript + Tailwind v4 + SQLite via Drizzle/better-sqlite3 | One repo, zero infra, real tables; swap to Postgres later is a driver change |
| Where matching runs | **Browser**, pure TS functions in `useMemo` | 49 rows ≈ 10 KB. Re-rank per keystroke needs zero network. Dataset loaded once server-side and passed as props |
| CSV lifecycle | Hashed on boot; unseen hash → new `snapshots` row + normalized rows. Old snapshots kept. App serves latest | Restart-safe, future diffs ("rate sheet changed since last call"), audit |
| Normalization | `lenders`, `program_types`, `business_types`, `special_requirements` lookups; `lender_programs` fact table with FKs and `snapshot_id` | Requested by product for future capabilities; special requirements carry a `rule_key` the engine switches on |
| Nulls | Blank `max_existing_debt_ratio` → NULL = "no rule listed" (never 0). `eligible_business_types = All` → NULL FK | Blank ratio must not fail anyone |
| Unknown special requirement in a new CSV | Ingest throws with the phrase | Forces a human to decide the rule semantics rather than silently ignoring it |
| Intake persistence | `localStorage` only, via a tiny external store (`useSyncExternalStore`) | No server writes during a call except the send log; survives refresh |
| Customer actions | `mailto:` with a drafted body, plus clipboard copy of the same draft, plus a POST to the traction log | Some environments swallow `mailto:`; the rep still has the text |
| Auth | `users` (`role` = sdr / manager) + `sessions` (random token = cookie). One login form for everyone; the role gates manager-only APIs. Passwords stored **plain text** — demo accounts only, seeded in migration 0001 | Hashing judged overkill for a demo (decided 2026-09-30) |
| Traction log | `recommendations` (SDR, kind = proposal / comparison, customer name + email, time) + `recommendation_programs` junction to `lender_programs` | Managers want which programs get sent most and what gets compared to what. Pairs are a self-join on the junction, not a table. Logged when the SDR clicks the mail button — `mailto:` is a draft, so delivery is unobservable |
| Manager view | `/manager` (server-checked: no session → `/login`, SDR → `/`) fetches `GET /api/traction` (401 anonymous, 403 non-manager). One query pulls every send-program row in the period; totals, ranking, "most compared with" pairs, "most recommended by" reps and last-sent are aggregated in JS | Data is tiny (tens to hundreds of sends). Program identity = lender + program type, so totals survive rate-sheet re-imports. Built from Paper artboard "Manager · Option 1b" |
| Login page | `/login`: one form for everyone; the response role decides the landing page (manager → `/manager`, SDR → `/`). `/` and `/manager` both redirect to `/login` without a session | Every send needs an SDR behind it |
| Send logging | "Email proposal" posts `{kind: proposal, programIds: [id]}`; "Send comparison" posts the compare columns as `comparison` (one column → logged as a proposal). Posted from the mail button's click with `keepalive`, alongside the clipboard copy and `mailto:` | The click is the only observable moment; a 1-program "comparison" email is a proposal in substance |
| Fonts | Inter stand-in | Real Newity fonts (Neue Haas Grotesk, Proxima Nova) not installed |

## 3. Data model (CSV → tables)

CSV fields, 49 rows, 15 lenders, 5 program types:

`lender_name, program_type, min_loan_amount, max_loan_amount, min_credit_score, credit_tier_required, min_years_in_business, interest_rate_min, interest_rate_max, max_term_months, sba_guarantee_pct, eligible_business_types, requires_collateral (Yes|No|Varies), max_existing_debt_ratio (or blank), turnaround_days, special_requirements (blank or one phrase), last_updated (M/D/YYYY)`

Ignored by rules (display only or redundant): `credit_tier_required` (redundant with score), `sba_guarantee_pct`, `last_updated`.

The 10 special-requirement phrases and their `rule_key`:

| Phrase | rule_key |
|---|---|
| Must be in business at least 6 months before applying | `six_months` |
| Requires 10% owner injection | `injection_10` |
| Must demonstrate positive cash flow | `positive_cash_flow` |
| Franchise must be SBA-approved | `franchise_sba` |
| Owner-occupied real estate only | `owner_occupied_only` |
| Owner must have 20%+ equity stake | `equity_20` |
| No recent bankruptcies (7 years) | `no_bankruptcy` |
| Requires business plan for startups | `business_plan_startup` |
| Real estate purchase only | `real_estate_only` |
| Cannot be used for refinancing | `no_refi` |

### Logins, traction log and manager view (added 2026-09-30)

Seeded users: `sdr1`…`sdr8` (names "Priya SDR 1" … "Marcus SDR 8"), `manager1`, `manager2` ("Sales Manager 1/2"); password is `password` for all (migration 0002, changed from username-as-password on 2026-09-30).

`recommendation_programs.lender_program_id` pins the exact rate-sheet row that was sent. Program ids change per snapshot, so traction totals across snapshots group by `lender_id` + `program_type_id` — verified unique across the 49 CSV rows. Snapshot is reachable through that join and is not repeated on `recommendations`.

Left out deliberately: a customers table, requested amount / business name on the recommendation, tier or payment at send time, list order, indexes.

**Manager traction view** (`src/components/manager/`, design: Paper "Manager · Option 1b — Row clicked, expanded"):

- Filters: calendar month (defaults to the current month; "All time" available; months offered run from the first send through next month, so an upcoming month can be picked) and rep (all SDRs or one). Both are query params on `GET /api/traction`: `from` inclusive, `to` exclusive, `rep` = user id.
- Time zones: `sent_at` is stored as UTC ISO. The month filter is the **browser's local month**, converted to UTC instants before the request, so a 7pm Central send on Sep 30 counts as September (bug found 2026-09-30: UTC-midnight cut-off hid evening sends from the current month). Dates in the UI render in local time.
- Summary strip: sends · comparisons (blue) · sent solo (green) · programs with ≥1 send of programs in the latest snapshot.
- Ranked list: total desc, then compared desc, then lender name. Bar = compared and solo widths relative to the #1 program's total. Top 8 shown; "Show all N programs with sends" expands.
- Row click: "Most compared with" = top 3 programs that shared a comparison with it (pair counts are a self-join, not a table); "Most recommended by" = top 3 SDRs by sends of that program (any kind), with "N other reps sent it M times" for the rest; "Last sent <date> · <rep>". A program only ever sent solo shows "Only sent on its own so far".
- Not built from the mock: the "See all N sends" link (no destination designed). Added beyond the mock: a "Log out" link in the top bar; rep avatars use first initial + last token ("Priya SDR 1" → P1).
- Demo data: 72 backdated September 2026 sends were inserted directly into `data/app.db` on 2026-09-30 so the view has something to show (script outside the repo). Wipe with `DELETE FROM recommendation_programs; DELETE FROM recommendations;`.

## 4. Intake — what we ask and why

Principle: **only ask what a rule or the ranking reads.** Everything else was cut to keep the rep from drowning in fields.

| Field | Used by |
|---|---|
| Business name, contact name, customer email | Talk track, email draft |
| Requested amount | Amount rule; payment math; injection % |
| Loan purpose | `real_estate_only`, `owner_occupied_only`, `no_refi` |
| Target funding (days) | Turnaround rule (soft) |
| Desired monthly payment | Ranking penalty; affordability "customer's target" |
| Owner injection | `injection_10` — measured against **requested amount** ("Injection is 11.1% of loan") |
| Available collateral (free text) | Collateral watch |
| Industry | Industry rule |
| Franchise Y/N | `franchise_sba` |
| Time in business (yrs + mos) | Years rule, `six_months`, `business_plan_startup` (< 12 months = startup) |
| Owner-occupied Y/N | `owner_occupied_only` — **shown only when purpose = Real estate purchase** |
| Ownership % (stepper, −/+ by 5) | `equity_20` — an "open question" until answered |
| Est. credit score (dropdown of bands) | Credit rule — stores the band's **lower bound**, so a band only clears a floor when all of it does |
| Profit / cash flow (yr) | Debt ratio, `positive_cash_flow` |
| Existing debt payments (/mo) | Debt ratio |
| Bankruptcy in last 7 yrs | `no_bankruptcy` — an "open question" until answered |

Removed as unused: project cost, state, business stage, annual revenue, current debt balance.

**Debt ratio** is computed, never asked: `monthly debt payments ÷ (annual cash flow ÷ 12)`.

## 5. Rule engine

Each rule returns `pass | fail | unknown | watch | n/a`.

- `n/a` = program has no such constraint; not counted. This is why one card says "7 of 7" and another "6 of 6".
- `unknown` = an intake gap blocks the check; carries which field would resolve it.
- `watch` = known, counts as a rule, **counts as passing**, but the rep must confirm it (design: Frontier is "7 of 7" with two watch items).

| Rule | Hard? | Logic |
|---|---|---|
| amount | hard | min ≤ requested ≤ max |
| industry | hard | program is All, or equals intake industry |
| credit | hard | score ≥ min_credit |
| years | hard | years + months/12 ≥ min_years |
| debt_ratio | hard | ratio ≤ max; CSV NULL → n/a; cash flow ≤ 0 → fail |
| turnaround | soft | turnaround_days ≤ target; no target → n/a |
| collateral | watch | requires_collateral = Yes and no collateral listed |
| special | varies | see below |

Special requirement semantics:

- `six_months` hard: months in business ≥ 6
- `injection_10` hard: owner injection ≥ 10% of requested amount
- `positive_cash_flow` hard: cash flow > 0
- `franchise_sba`: n/a if not a franchise; watch if it is; unknown if unanswered
- `owner_occupied_only` hard: purpose must be Real estate purchase **and** owner-occupied = Yes; other purposes fail outright
- `real_estate_only` hard: purpose must be Real estate purchase
- `equity_20` hard: ownership ≥ 20%; unknown until asked
- `no_bankruptcy` hard: bankruptcy = No; unknown until asked
- `business_plan_startup`: watch if under 12 months in business, else n/a
- `no_refi`: fail if purpose = Refinance; otherwise a watch ("confirm no part of the project is a refi")

**Payment vs. desired payment is NOT a rule.** The design keeps Heritage at ~$3,070 (target $2,500) as "Strong fit". It only affects ranking and the summary line.

### Tier

```
any hard fail                 → ineligible
else any soft fail (too slow) → poor
else any unknown              → potential   ("N of M rules known", "one answer away")
else                          → strong
```

Too-slow deliberately outranks one-answer-away: a program that misses the deadline isn't worth spending an open question on (design puts Midwest 504 in "too slow", not "potential").

### Best-fit score (lower is better, tie-break lender name)

```
score = rateMid
      + 0.05 × turnaround_days                       (~20 days of waiting ≈ 1 pt of rate)
      + 6.5  × max(0, payment − desired) / desired   (15% over target ≈ 1 pt)
      + 0.5  × friction                              (any special condition, or a collateral watch)
```

Weights were tuned so the design's top 3 reproduce for the sample customer: Frontier SBA Express, First National 7(a) Small, Heritage SBA Express. Sorting is always tier first, then the preset key: best-fit score · rate midpoint · turnaround days · payment · collateral = No first.

### No-match diagnosis

When nothing is strong or potential, the list shows "No program clears every hard rule yet. Check industry, credit and time in business." followed by a table of blocking fields. For each hard rule: count programs whose **only** hard failure is that rule ("unlocks on its own"), and state the loosest threshold among them — e.g. "Est. credit score · at least 600 (customer est. below 600) → 20 programs". Fields that block programs but never alone are listed with "blocks N". If poor-fit programs exist, a line notes how many pass every hard rule but miss the funding target and the fastest available turnaround.

### "The other N programs" buckets

Poor + ineligible programs only (potentials are listed separately as open questions). First matching reason wins:

1. property-only (`real_estate_only` / `owner_occupied_only` failed)
2. wrong industry
3. amount / credit
4. too slow
5. other

Known mock inconsistency: the design shows 19/9/4/5; no single precedence produces that. Code produces 20/9/3/5 (= 37) for the sample customer.

## 6. Money

Standard amortization at the **rate midpoint**; payment range uses rate min/max.

```
r = apr / 1200
payment(P, apr, n)       = P·r / (1 − (1+r)^−n)
totalInterest            = payment·n − P
solveMonths(P, apr, M)   = −ln(1 − r·P/M) / ln(1+r)     (M ≤ P·r → never pays off)
interestAtPayment        = M·solveMonths − P
saved                    = totalInterest − interestAtPayment
```

Display: payments rounded to $10 ("~$2,470"), totals to $100 ("~$116,900"), months → `ceil` → "7 yrs 8 mo".
Affordability slider: min = minimum-schedule payment rounded up to $10; max = 1.8× min rounded up to $500; step $10. Selecting a compare column (header or any cell) highlights the whole column and drives the slider.

### Compare set

- The compare set is **only what the rep adds** — no default columns. Empty state invites adding from the ranked list or via an inline picker.
- Limit **4** programs. Cards show "Compare full (4)" once reached; remove one to add another.
- Ineligible programs can't be added, and a program that becomes ineligible after an intake change silently drops out of the set.
- Ranked-list cards make membership obvious: blue border, an "In compare" pill (click → opens compare), and the action reads "✓ In compare · remove" (toggle).
- Every column header is a picker: swap for another eligible program, or remove. Ineligible entries in the picker are struck through; hovering shows the failing rules.
- Tier pills for poor / ineligible programs carry a tooltip listing exactly which rules fail (and any unanswered ones), same style as the rules tooltip.

All of the design's numbers reproduce exactly and are pinned in `src/lib/money.test.ts`.

## 7. Copy rules

- **Say this** is customer-safe: rates as whole percents, term in words, payment range, funding in weeks, always ends "Final terms come from underwriting."
- **Why it fits** = pass reasons. **Watch** = watch + unknown items, plus "oldest rate sheet in this snapshot" when applicable.
- **REP ONLY** strip: SBA guarantee, min credit, min time, max debt ratio, rate-sheet date. Never read to the customer.
- Compare "Say this" names lowest payment, fastest, simplest file, then asks "payment or speed?"
- Email drafts: greeting by first name, estimates disclaimer, per-program rate / payment / funding / collateral / note, sign-off "— Newity".

## 8. Sample customer (matches the design's numbers)

Use this profile to check any change against the design.

```
Business name        Marisol's Taqueria
Contact              Marisol Reyes
Customer email       marisol@example.com

Requested amount     $180,000
Loan purpose         Equipment + working capital
Target funding       Within 30 days
Desired payment      $2,500 /mo
Owner injection      $20,000          → 11.1% of loan
Available collateral Kitchen equipment ~$60k

Industry             Restaurant / Food Service
Franchise            No
Time in business     3 yrs 4 mos
Ownership %          (unanswered — open question)

Est. credit score    680–699 band  (design used 690)
Profit / cash flow   $96,000 /yr
Existing debt pmts   $2,400 /mo     → debt ratio 0.30
Bankruptcy 7 yrs     (unanswered — open question)
```

Expected results:

| Check | Expected |
|---|---|
| Tier counts | 10 strong · 2 potential · 9 poor · 28 ineligible |
| #1 | Frontier Capital Group · SBA Express · Strong · 7 of 7 · ~$2,470/mo ($2,390–$2,560) · ~14 days · watch: no-refi, oldest rate sheet (Jan 1, 2026) |
| #2 | First National Bank · 7(a) Small Loan · 6 of 6 · ~$2,540/mo · ~20 days |
| #3 | Heritage Credit Union · SBA Express · 6 of 6 · ~$3,070/mo · ~10 days · lowest rate ceiling |
| First potential | BlueRidge Lending Partners · SBA Express · 5 of 6 known · needs ownership % |
| Total interest (compare) | ~$116,900 · ~$124,900 · ~$77,700 |
| Affordability, Frontier @ $2,900/mo | paid off 7 yrs 8 mo · ~$86,800 interest · ~$30,200 saved · slider max $4,500 → 4 yrs 2 mo |
| Other programs | 37 total: 5 property-only · 20 wrong industry · 3 amount/credit · 9 too slow |

To seed it in a browser console:

```js
localStorage.setItem('newity.intake.v2', JSON.stringify({businessName:"Marisol's Taqueria",contactName:'Marisol Reyes',customerEmail:'marisol@example.com',requestedAmount:180000,purpose:'Equipment + working capital',targetDays:30,desiredPayment:2500,ownerInjection:20000,industry:'Restaurant/Food Service',years:3,months:4,franchise:'No',ownerOccupied:null,ownershipPct:null,creditScore:680,cashFlow:96000,debtPayments:2400,collateral:'Kitchen equipment ~$60k',bankruptcy:null}))
```

## 9. Open threads / ideas not built

- Full call history (the traction log records only sent recommendations, not the intake).
- "See all N sends" drill-down per program (link exists in the mock, not built).
- Real email sending instead of `mailto:`.
- Snapshot diffing ("this lender's rate changed since last week").
- Lender-specific program blurbs come from a hard-coded map in `ingest.ts`; a future CSV column could replace it.
