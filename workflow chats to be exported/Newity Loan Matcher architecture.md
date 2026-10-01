# Newity Loan Matcher architecture

- **Session ID:** `9c001159-d2bd-4b9c-90e2-bfffa8a08206`
- **Started:** 2026-09-29 23:36
- **Last activity:** 2026-09-30 01:24
- **Prompts:** 6

> Tool calls Claude made are listed as 🔧 lines; tool outputs and internal reasoning are omitted.

---

## 🧑 Prompt · 2026-09-29 23:36

> Do not refer to the docx file.  Only the CSV file and the paper design document called "Newity Loan Matcher"
>
> Refer to the Newity Loan Matcher paper design that I have. The idea is to implement all three of the screens, including the affordability calculator for the selected program in the compare section. 
>
> But first, we need to have a conversation about the backend of this. The page being highly responsive and fast is of a very high priority, but we are also working off of a CSV. The CSV is going to be included inside this project, and upon booting, the CSV needs to be consumed for all the information that it has. That is only because we might get another CSV of this type. It might have different data in it, but it's going to be consistent on the field level. 
> I mentioned the priority of the responsiveness of the page and the speed of the page, but we still need to organize the CSV data into organized tables because this unlocks future capabilities. 
>
> Refer to the CSV and the paper design .  And then let's have a discussion about the architecture of the backend and the frontend. 
>
> /caveman


## 🤖 Claude

- 🔧 `Skill` — caveman

Look at project dir, CSV, Paper file first.

- 🔧 `Bash` — List project files
- 🔧 `Read` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv
- 🔧 `Read` — /Users/abhilashtripathy/.claude/projects/-Users-abhilashtripathy-Developer-Claude-Stuff-NEWITY-NEWITY-loan-matcher/memory/newity-loan-matcher-paper-file.md
- 🔧 `ToolSearch` — select:mcp__paper__get_guide,mcp__paper__get_basic_info,mcp__paper__get_tree_summary,mcp__paper__get_screenshot,mcp__paper__get_children,mcp__paper__get_node_in
- 🔧 `mcp__paper__get_guide`
- 🔧 `mcp__paper__get_basic_info`

Screenshots of all three artboards.

- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__get_screenshot`

Have CSV + all 3 screens. Quick CSV shape check, then architecture draft.

- 🔧 `Bash` — Count distinct values per CSV column
- 🔧 `Write` — /Users/abhilashtripathy/.claude/plans/do-not-refer-to-harmonic-lamport.md
- 🔧 `AskUserQuestion`
- 🔧 `Agent` — Spec matching engine + math

Spec verified — design numbers reproduce exactly with midpoint-rate amortization, round-to-$10 payments, round-to-$100 totals. Finalizing plan file.

- 🔧 `Write` — /Users/abhilashtripathy/.claude/plans/do-not-refer-to-harmonic-lamport.md
- 🔧 `ToolSearch` — select:ExitPlanMode
- 🔧 `ExitPlanMode`

Scaffold + pull Paper structure in parallel.

- 🔧 `Bash` — Scaffold Next.js app in scratchpad
- 🔧 `mcp__paper__get_tree_summary`
- 🔧 `mcp__paper__get_tree_summary`
- 🔧 `Bash` — Move scaffold into project, relocate CSV, install deps
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_tree_summary`
- 🔧 `Bash` — Check project state after failed copy
- 🔧 `mcp__paper__get_jsx`
- 🔧 `mcp__paper__get_jsx`
- 🔧 `Bash` — Check installed dev deps and scaffold files

Dev deps missing. Install + write foundation files (CSS, layout, lib types/money) in parallel.

- 🔧 `Bash` — Install drizzle-kit, vitest, sqlite types
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/app/globals.css
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/app/layout.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/types.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/money.ts
- 🔧 `Bash` — Show peer dependency conflict detail
- 🔧 `Bash` — Bump @types/node and install dev deps
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/rules.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/rank.ts
- 🔧 `Bash` — Verify better-sqlite3 native build loads
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/db/schema.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/db/client.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/drizzle.config.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/db/ingest.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/db/queries.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/instrumentation.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/app/api/programs/route.ts
- 🔧 `Bash` — Fix ingest helpers, add scripts, generate Drizzle migration
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/money.test.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/db/ingest.test.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/intake.ts
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/lib/copy.ts
- 🔧 `Bash` — Run unit tests for money, ingest, rules

Money + ingest pass. Rule tiers off vs design — debugging which rule over-fails.

- 🔧 `Bash` — Dump per-program rule results for Marisol intake
- 🔧 `Bash` — Rerun debug dump showing all output
- 🔧 `Bash` — Remove term rule, count watch as pass, reorder tiers, rerun tests
- 🔧 `Bash` — Show remaining tier count assertion diff

Found it: design computes injection % against the loan amount ($20k/$180k = 11.1%), not project cost. Fixing.

- 🔧 `Bash` — Base injection % on loan amount, rerun tests
- 🔧 `Bash` — Fix bucket precedence and scope, rerun tests
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/icons.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/TopBar.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/intake/IntakeRail.tsx

All 13 tests pass. Writing match cards, compare table, affordability, app shell.

- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/matches/MatchCard.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/matches/MatchList.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/compare/CompareView.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/compare/Affordability.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/App.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/app/page.tsx

Typecheck + lint, then boot dev server in browser.

- 🔧 `Bash` — Typecheck and lint the project

Types clean. Fixing 2 lint errors (setState-in-effect) with a store + keyed-state pattern, then launching.

- 🔧 `Bash` — Replace effects with external store and keyed state, add launch config, re-lint
- 🔧 `Bash` — Fix null narrowing in intake store, re-run typecheck and lint
- 🔧 `Bash` — Remove unused param, re-lint
- 🔧 `mcp__Claude_Browser__preview_start`
- 🔧 `mcp__Claude_Browser__preview_logs`
- 🔧 `mcp__Claude_Browser__computer`

Boots, snapshot imported. Pane is narrow; resizing to design width and filling Marisol's intake.

- 🔧 `mcp__Claude_Browser__resize_window`
- 🔧 `mcp__Claude_Browser__read_page`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__javascript_tool`
- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `Bash` — Reweight best-fit score, unclip stat values, rerun tests
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Show top-4 ranking diff
- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `Bash` — Add friction penalty to score, rerun tests
- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `Bash` — Adjust slider ceiling and show ranking test diff
- 🔧 `mcp__Claude_Browser__javascript_tool`
- 🔧 `mcp__Claude_Browser__read_console_messages`
- 🔧 `Bash` — Fix ranking test expectation, rerun
- 🔧 `mcp__Claude_Browser__javascript_tool`
- 🔧 `Bash` — Keep blank spacer lines in mailto body
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/README.md
- 🔧 `Bash` — Add second-snapshot ingest test and run
- 🔧 `Bash` — Count programs in latest snapshot only, rerun tests
- 🔧 `mcp__Claude_Browser__find` — Frontier Capital Group 7(a) Small Loan
- 🔧 `mcp__Claude_Browser__read_page`

Mailto now has proper spacing. Swapping column 2 to Frontier 7(a) Small, running the production build, and updating memory in parallel.

- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Lint and run production build
- 🔧 `Write` — /Users/abhilashtripathy/.claude/projects/-Users-abhilashtripathy-Developer-Claude-Stuff-NEWITY-NEWITY-loan-matcher/memory/newity-loan-matcher-decisions.md

Build passes. The column swap click didn't register — checking via script.

- 🔧 `mcp__Claude_Browser__javascript_tool`

Swap worked (batch screenshots lag a render). Final screenshot, reset viewport, update memory index.

- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `Bash` — Update memory index, clean scratch, inspect live DB
- 🔧 `mcp__Claude_Browser__resize_window`

Done. App running at http://localhost:3000 in browser pane, all 3 screens built and verified against the Paper design.

**What exists now**

- **Backend:** Next.js 16 + SQLite/Drizzle. Boot hook hashes `data/lenders.csv` → new hash = new `snapshots` row + 49 normalized rows across `lenders`, `program_types`, `business_types`, `special_requirements`, `lender_programs`. Restart = "exists", no dupes. `GET /api/programs` serves latest snapshot with ETag. Test proves a changed CSV becomes snapshot #2 and gets served.
- **Frontend:** dataset passed once server→client; rules, ranking, talk tracks, amortization all pure TS in `useMemo`. Zero network during call. Intake in localStorage. Customer-email field added; Send/Start buttons are `mailto:` with drafted comparison.
- **Verified in browser with Marisol intake:** 10/2/9/28 tier counts, Frontier #1 "7 of 7", ~$2,470/mo, top 3 = Frontier / First National / Heritage, compare table $116.9k/$124.9k/$77.7k with LOWEST/FASTEST badges, slider $2,900 → 7 yrs 8 mo / ~$86,800 / ~$30,200 saved, column picker grouped by tier with struck ineligibles. 14 tests pass, lint + `next build` clean.

**Judgment calls made (design was a hand mock, not fully consistent)**

- Payment-over-target = ranking factor only, not a rule. Design keeps Heritage at $3,070 "Strong fit".
- Watch items count as passing rules → "7 of 7".
- Too-slow beats one-answer-away. Design puts Midwest 504 in "too slow", not "potential".
- Injection % measured against loan amount ($20k/$180k = 11.1%), matching design copy.
- "Other programs" buckets: design shows 19/9/4/5. No consistent precedence gives that. Code yields 20/9/3/5 via property-only > industry > amount/credit > slow.
- Best-fit weights tuned so top 3 match design. Formula in `rules.ts`: rate + 0.05/day + 6.5×payment-overage + ½ per special condition.

**Not done / your call**

- Folder is not a git repo. Did not init.
- No auth, no server-side call sessions (per your answers).
- Fonts: Inter via next/font. Real Newity fonts (Neue Haas, Proxima) not installed.

Files: [README.md](README.md) has run + architecture. Rule engine [rules.ts](src/lib/rules.ts), math [money.ts](src/lib/money.ts), ingest [ingest.ts](src/db/ingest.ts).

---

## 🧑 Prompt · 2026-09-30 00:33

> <pasted_content id="f811">
> A few improvements that might be useful are:
>
> * The color scheme of the ranked list and compare, or selecting the pills (best fit, lower straight, etc.), is black on blue, which is not a good contrast. Let's just go with white text on a blue-colored pill for that.
> * On the left side of the call intake, I want to review all the things that are needed. For example, since none of the programs are supporting the business stage, we should get rid of it. We generally want to review all of the things that need to exist on the left pane, and we don't want to overwhelm the salesperson with too many input fields to fill in. We want to keep it simple.
> * There are some just aesthetic changes that I would like to make. For example, the time and business input field extends towards the end, and in the loan needed section, the input box doesn't align because maybe the descriptions are overflowing, so we want to fix that. For the ownership percentage, we would want to have
> </pasted_content id="f811">
>
>  an increment and decrement button As well 
> * The `mailto:` also does not work, so look into whether it's my system thing. 
> * Also, for the rule 2 out of 6 rules known, or 1 out of 6 rules known that exist on the top right of the cards, I want a tooltip that, on hover, will tell me what the rules are. 
> * Even the organization of the elements under the "Say this" section is not very well organized compared to the rest of the page. Also, we don't really need a button for "Start Application." We're not going to be starting an application. This is just to mail the caller a proposal of the program of the loan.


## 🤖 Claude

Six items. Root cause on pill contrast is clear already: my unlayered `button { color: inherit }` beats Tailwind's layered `text-white`. Reviewing intake fields against the rule engine, then applying everything.

- 🔧 `Bash` — Find uses of intake fields under review
- 🔧 `Bash` — Layer base CSS, drop unused intake fields across lib, tests, top bar
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/intake/IntakeRail.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/RulesPill.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/MailLink.tsx
- 🔧 `Bash` — Refactor mail drafts, wire MailLink into compare view
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/matches/MatchCard.tsx
- 🔧 `Bash` — Typecheck, lint, test after refactor
- 🔧 `Bash` — Align MailLink prop name with draft shape, recheck
- 🔧 `mcp__Claude_Browser__resize_window`

Code clean. Reloading with Marisol's intake seeded (storage key changed), then checking pills, rail alignment, tooltip and the new Say-this panel.

- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__browser_batch`

Pills are white-on-blue now, rail aligned, new Say-this panel in place. One regression: pill labels wrap. Fixing, then checking the tooltip and the mailto click.

- 🔧 `Bash` — Stop pill labels wrapping in sort row
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__javascript_tool`
- 🔧 `mcp__Claude_Browser__read_console_messages`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Update README, run tests, lint and production build

Build hit a SQLite lock: Next's parallel page-data workers each run the migration at once. Adding a busy timeout. Also snapshotting the compare view.

- 🔧 `Bash` — Add SQLite busy timeout, run build twice to confirm no lock race
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `mcp__Claude_Browser__javascript_tool`
- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `Bash` — Record feedback-round decisions in memory

One layout bug left: the compare view's send button spills past the card edge. Fixing the MailLink wrapper, then verifying and resetting the viewport.

- 🔧 `Bash` — Prevent send button from overflowing card
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__resize_window`

All six done. Tests 14/14, lint clean, `next build` passes.

**Pill contrast** — root cause was CSS, not the class. My unlayered `button { color: inherit }` beat Tailwind's layered `text-white`. Moved base styles into `@layer base`. Selected pills now white on blue everywhere (sort presets, Ranked/Compare toggle).

**Intake trimmed to what rules read.** Dropped: project cost (injection % uses loan amount), state, business stage, annual revenue, debt balance. Owner-occupied only appears when purpose = Real estate purchase. "Requires business plan for startups" now keys off under-12-months in business. Result: 13 fields (was 19). Storage key bumped, so old saved intake is cleared.

**Aesthetics.** Time-in-business inputs split evenly. Labels shortened + nowrap so boxes align ("Desired payment", "Owner injection"). Debt ratio moved into a calculated chip beside debt payments. Ownership % is a − / + stepper (steps of 5, typing allowed), amber-dashed while open.

**Rules tooltip.** Hover or focus the "N of M rules" pill → panel listing every rule: ✓ pass · ! confirm · ? unanswered · × fail, with the reason. Present on expanded and collapsed cards.

**Say this panel.** One bordered panel: quote (with Copy in header) → Next step → [Email proposal] [Add to compare]. "Start application" gone; "Email proposal" mails a one-program proposal to the customer.

**mailto.** Two fixes:
- Email address was percent-encoded (`%40`); some handlers choke on that. Now raw.
- On click the draft is also copied to clipboard and a "Draft copied — opening your mail app" note shows. So if `mailto:` is swallowed, you still have the text.

Can't verify your mail client from here. Likely culprits: no default mail app set on macOS (System Settings → Desktop & Dock → Default email reader), or the link being clicked inside the Claude app's embedded pane, which doesn't open external handlers. Try it in Chrome/Safari at http://localhost:3000.

**Also fixed in passing:** `next build` raced on SQLite (parallel workers migrating) → added `busy_timeout`.

---

## 🧑 Prompt · 2026-09-30 00:52

> * Remove the on-call mention from the heading of the page and add a dropdown for the credit score.
> * When I click on the email proposal, something appears, which is hidden because it's probably bleeding out of the constraints of the element of the frontend. Let's fix that.
> * In the comparison mode, I should be able to select the other options instead of just the default one, and the entire column should be highlighted, not just the name heading. Obviously, that should actively update the affordability section as well.


## 🤖 Claude

Three changes. Credit dropdown will store the band's lower bound so a band only passes a lender's floor when the whole band clears it.

- 🔧 `Bash` — Remove on-call pill, add credit band dropdown, inline mail confirmation

Now the compare column selection. Reading the current CompareView header/row code to patch it.

- 🔧 `Bash` — Locate selection and highlight code in CompareView
- 🔧 `Bash` — Read Picker header, column header loop, and rep-only row
- 🔧 `Bash` — Make compare columns selectable with full-column highlight
- 🔧 `Bash` — Fix self-referencing Row alias, recheck
- 🔧 `mcp__Claude_Browser__resize_window`

Lint refuses a component defined inside render. Switching to explicit props on each row; then reloading the (apparently stuck) browser pane.

- 🔧 `Bash` — Pass highlight and select handler explicitly to each Row
- 🔧 `mcp__Claude_Browser__read_console_messages`

Those are stale errors from mid-edit states. Reloading and verifying the compare column selection end-to-end.

- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `mcp__Claude_Browser__tabs_context`
- 🔧 `mcp__Claude_Browser__preview_logs`

Server is healthy. Testing whether the pane itself responds.

- 🔧 `mcp__Claude_Browser__get_page_text`

Pane is likely blocked by a dialog from the earlier real mailto click. Closing the tab and reopening.

- 🔧 `mcp__Claude_Browser__tabs_close`
- 🔧 `mcp__Claude_Browser__preview_start`
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Run tests and production build
- 🔧 `mcp__Claude_Browser__resize_window`

Done. Tests 14/14, build clean.

**Header.** On-call pill and clock removed. Top bar is brand + snapshot info only.

**Credit score dropdown.** Ten bands aligned to the CSV's actual floors (600/620/640/650/660/680/700): "740+ · Excellent" down to "Below 600". Stored value = band's lower bound, so "680–699" clears a 680 floor but not 700. Conservative by design. Rule copy now reads "Est. credit 680+ clears the 650 floor".

**Email proposal feedback.** The hidden thing was my confirmation note, absolutely positioned below the button inside a panel with `overflow-clip`. Replaced with an inline swap: the button itself turns dark and reads "Draft copied · opening mail" for 2.5s, then reverts. Nothing positioned outside its box anymore.

**Compare column selection.**
- Click any column header (name area) or any cell in the column → that column becomes selected.
- Whole column tints blue: header, every row, REP ONLY thresholds.
- Affordability panel switches to it immediately (rate, min payment, slider range all recompute).
- Chevron on the right of the header is now a separate button that opens the swap picker, so selecting and swapping don't collide.
- Affordability's own dropdown still works the other direction and highlights the matching column.

**Side note on the browser pane.** My earlier real click on the mailto link froze the Claude in-app pane until I closed the tab. That's consistent with what you saw: this pane can't hand off to a mail client. Test in Chrome/Safari.

---

## 🧑 Prompt · 2026-09-30 01:06

> I want you to save all of the logic and design decisions, excluding any minor frontend changes such as button tweaks. Include the overall design decisions and an example customer profile (with sample information) in a Markdown file named “context” so that we can make further iterations in the future.


## 🤖 Claude

- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/context.md

Saved to [context.md](context.md).

Sections:
1. What the tool is + sources of truth (CSV, Paper design; not the docx)
2. Architecture decisions table (stack, browser-side matching, snapshot versioning, normalization, nulls, localStorage, mailto + clipboard)
3. Data model + the 10 special requirements → rule keys
4. Intake: every field and which rule reads it; what was cut and why
5. Rule engine: statuses, hard/soft table, special-requirement semantics, tier order, best-fit score formula with weights, bucket precedence, known mock inconsistency
6. Money formulas, rounding, slider bounds
7. Copy rules (Say this, Watch, REP ONLY, email drafts)
8. Sample customer (Marisol's Taqueria) with every input, expected outputs table, and a one-line console seed
9. Open threads not built

Excluded: pill colors, button labels, layout tweaks, tooltip styling.

---

## 🧑 Prompt · 2026-09-30 01:13

> I want the listing page to clearly indicate when a program has been added to the comparison. The comparison should only include programs that the user adds; we don’t need to always show three programs by default. Increase the comparison limit to four and verify that the frontend remains functional. Additionally, when a loan program is ineligible, hovering over it should display a tooltip that lists the specific rules it fails, similar to the earlier rules tooltip.


## 🤖 Claude

Plan: compare becomes an explicit ordered list of up to 4 programs (no defaults), cards show an "In compare" state with remove, compare view gets an empty state + "add" slot + per-column remove, and the tier pill grows a failing-rules tooltip for ineligible/poor programs.

- 🔧 `Bash` — Read App state and compare hooks in cards
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/App.tsx
- 🔧 `Write` — /Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY-loan-matcher/src/components/RulesPill.tsx
- 🔧 `Bash` — Read card header/footer and list wiring to patch
- 🔧 `Bash` — Rewrite App state, wire in-compare state into cards and list; read CompareView for rewrite
- 🔧 `Bash` — Rework CompareView for explicit 0–4 columns, empty state, remove, fail tooltips
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Run tests and production build
- 🔧 `Bash` — Fix pragma order and header wrapping; build three times
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Open SQLite lazily per request; build four times to confirm
- 🔧 `mcp__Claude_Browser__browser_batch`
- 🔧 `Bash` — Wrap header names, move remove into menu, document compare decisions, re-verify
- 🔧 `Bash` — Update project memory with latest decisions
- 🔧 `mcp__Claude_Browser__browser_batch`

Full lender names now show in all four headers. Final visual check + viewport reset.

- 🔧 `mcp__Claude_Browser__browser_batch`

Two last nits visible: "Strong fit" pill wraps, and long lender names still clip at two lines. Widening the columns slightly (label column 200→160, tighter header padding) and no-wrap on pills.

- 🔧 `Bash` — Widen compare columns, no-wrap tier pills
- 🔧 `mcp__Claude_Browser__browser_batch`

Done. Names unclipped in all four headers, pills single-line, tests 14/14, lint clean, build passes 4 of 4 runs.

**Compare is now explicit.**
- Starts empty. Empty state offers an inline picker or "Browse ranked list".
- Limit 4. Once full, other cards read "Compare full (4)" with a tooltip to remove one first.
- Ineligible programs can't be added. A program that turns ineligible after an intake change drops out on its own.
- Each column header: click name → selects for affordability (whole column highlights). Chevron → menu with "× Remove … from compare" at top, then the grouped swap list. A dashed "+ Add a program" slot appears while there's room.
- Label column narrowed to 160px so four columns fit at 1440 without truncating names.

**Ranked list shows membership.** Card gets a blue border, an "In compare" pill (click opens compare), and the action toggles: "Add to compare" ↔ "✓ In compare · remove". Collapsed cards: "Compare" ↔ "✓ Comparing · remove".

**Ineligible / poor tooltip.** Hover or focus the tier pill → "Why it's ineligible" listing each failing rule with reason (e.g. "× Loan amount in range · $180,000 is below the $250k minimum", "× Industry eligible · Healthcare only"). Also applied to the compare picker's struck-through entries as a native title.

**Build fix in passing.** SQLite was opened at module import, so `next build`'s parallel page-data workers raced on it. It now opens lazily on first request via `getDb()`. Build no longer touches the DB at all.

Decisions recorded in [context.md](context.md) under "Compare set".

---

## 🧑 Prompt · 2026-09-30 01:23

> If no programs match at all, then sometimes it's likely that it's one of the fields that disqualifies the customer for all of the programs. If that is the case, I want you to say that right below: "No program clears every hard rule yet. Check industry credit and time in business." Below that, you need to write down which field requires at least what.


## 🤖 Claude

Approach: for each hard rule, count programs whose *only* hard failure is that rule, and derive the loosest threshold among them ("fixing this one field unlocks N"). Show under the empty-state message, sorted by unlock count.

- 🔧 `Bash` — Add blocker diagnosis and render it in the empty state
- 🔧 `Bash` — Add diagnose test and run suite
- 🔧 `mcp__Claude_Browser__browser_batch`

Works: credit shown as the single blocker unlocking 20 programs. Polishing the "500s" wording to "below 600", restoring the seed profile, documenting the diagnosis logic.

- 🔧 `Bash` — Fix credit wording, document diagnosis, rerun checks
- 🔧 `mcp__Claude_Browser__browser_batch`

Done. Tests 15/15, lint clean.

**Empty state now diagnoses the disqualifier.** Under "No program clears every hard rule yet. Check industry, credit and time in business." a table lists each blocking field:

| Field · needs at least | Unlocks on its own |
|---|---|
| Est. credit score · at least 600 (customer est. below 600) | 20 programs |
| Industry · these lend to Healthcare, Retail, … (customer: Restaurant / Food Service) | blocks 32 |
| Special conditions · Owner-occupied real estate only; Real estate purchase only | blocks 5 |
| Requested amount · nearest range is $250k–$5M (asked $180,000) | blocks 4 |

**Logic** (`diagnose` in [rules.ts](src/lib/rules.ts)): for each hard rule, find programs whose *only* hard failure is that rule. That count is "unlocks on its own". The requirement is the loosest threshold among those programs, so it's the minimum change that opens something up. Fields that fail but never alone show "blocks N" instead. Sorted by unlock count.

Requirement wording per field: credit → lowest floor; time in business → lowest minimum years; debt ratio → highest cap, with a hint to lower payments or raise cash flow; amount → nearest range; industry → what those programs lend to; special → the failing phrases.

If poor fits exist (all hard rules pass, too slow), a line adds how many and the fastest available turnaround so the rep knows loosening the target would help.

Verified in browser with credit set to "Below 600": 0/0/0/49 tiers, table as above. Test added for credit and industry cases. Documented in [context.md](context.md) under "No-match diagnosis".
