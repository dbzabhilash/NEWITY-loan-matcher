# Newity Loan Matcher

A sales tool for SBA lending. An SDR fills in the intake form during a call, and all 49 lender programs re-rank on every keystroke into strong, potential, poor and ineligible fits. The SDR can email one program or a side-by-side comparison to the customer. Sales managers get a view of which programs are actually being sent.

## Run

Requires Node 22+.

```bash
./scripts/start.sh
```

Open http://localhost:3000 and sign in at `/login`:

| user | role | lands on |
|---|---|---|
| `sdr1` … `sdr8` | SDR | `/` (matcher) |
| `manager1`, `manager2` | sales manager | `/manager` (traction) |

Every account uses the password `password`. These are demo accounts stored in plain text and seeded by a migration.

## Scripts

| command | what it does |
|---|---|
| `./scripts/start.sh` | Installs deps if `node_modules` is missing, then starts the dev server. On boot the app migrates SQLite and imports `data/lenders.csv`. |
| `./scripts/start.sh --reset` | Same, but first deletes `data/app.db`, which wipes sessions and the traction log. |
| `npm run dev` | Starts only the Next.js dev server (migrations and import still run on boot). |
| `npm run build` / `npm start` | Production build and serve. |
| `npm test` | Vitest: amortization math, CSV ingest, auth, recommendation logging, traction aggregates. |
| `npm run lint` | ESLint. |
| `npm run db:reset` | Alias for `./scripts/start.sh --reset`. |
| `npm run db:generate` | Generates a new SQL migration in `drizzle/` after you edit `src/db/schema.ts`. |
| `npm run db:studio` | Opens Drizzle Studio to browse `data/app.db`. |

## Major parts

### 1. SDR matcher and email sharing (`/`)

- **Intake rail** (`src/components/intake/`): asks only for fields that a rule or the ranking reads. The debt ratio is calculated from payments ÷ cash flow, so the SDR never asks for it. A refresh reloads a sample call (`DEFAULT_INTAKE` in `src/lib/intake.ts`).
- **Matching**: all of this runs client-side in a `useMemo`, so nothing goes over the network during a call.
  - `src/lib/rules.ts` is the rule engine. Hard rules include amount, industry, credit, years in business, debt ratio and special requirements. Turnaround is a soft rule, and collateral, franchise and no-refi are watch items. A rule with no answer yet becomes `unknown`, which shows as "potential fit, one answer away".
  - `src/lib/rank.ts` handles ranking presets. `src/lib/money.ts` does amortization at the rate midpoint. `src/lib/copy.ts` writes the talk tracks and email drafts.
- **Compare** (`src/components/compare/`) puts the top programs side by side, with an affordability slider.
- **Sharing**: *Email proposal* (1 program) and *Send comparison* (2–4 programs) open a `mailto:` draft addressed to the customer (`src/components/MailLink.tsx`). The same click does two more things:
  - copies the draft to the clipboard, in case `mailto:` doesn't open anything;
  - logs the send through `POST /api/recommendations`, which feeds the manager view.

### 2. Sales manager traction view (`/manager`)

- `src/db/traction.ts` totals the logged sends per program, which you can filter by month and by SDR (`GET /api/traction`, managers only).
- `src/components/manager/TractionTable.tsx` lists programs ranked by sends. For each one it shows:
  - how many sends were comparisons and how many were proposals;
  - the 3 programs it was most often compared with;
  - its top 3 senders, and its last send.
- A send records the moment the SDR clicked. Whether the email was actually delivered can't be observed.

### 3. CSV ingestion (`src/db/ingest.ts`)

- `data/lenders.csv` is the source of truth. On boot, `src/instrumentation.ts` hashes the file. If it hasn't seen that hash before, it creates a new `snapshots` row and loads the CSV rows into normalized SQLite tables (`lenders`, `program_types`, `business_types`, `special_requirements`, `lender_programs`) inside one transaction.
- To update the data, replace the CSV (keep the same columns) and restart. The app serves the latest snapshot and keeps the old ones.
- Every `special_requirements` phrase must map to a rule key in `SPECIAL_KEYS`. If the CSV has a new phrase, ingest fails loudly until you add it.
- `GET /api/programs` returns the latest snapshot as JSON, using the file hash as its ETag.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · SQLite via `better-sqlite3` + Drizzle ORM · `csv-parse` · Vitest.

Auth uses an httpOnly `session` cookie backed by the `sessions` table (`src/db/auth.ts`), and the `role` column gates the manager-only API.

```
data/lenders.csv     source CSV (app.db is created next to it)
drizzle/             SQL migrations, applied automatically on first DB open
scripts/start.sh     one-command start
src/app/             pages (/, /login, /manager) and API routes (login, logout, programs, recommendations, traction)
src/components/      intake/, matches/, compare/, manager/, shared UI
src/db/              schema, client, ingest, auth, recommendations, traction
src/lib/             pure logic: rules, rank, money, copy, intake, types
```

---

## Documents

| document | what it is |
|---|---|
| [PRD](docs/Newity_Loan_Matcher_PRD.pdf) | Product requirements. |
| [QA plan](docs/Newity_Loan_Matcher_QA_Plan.pdf) | Test plan. |
| [System map (PDF)](docs/system-map.pdf) · [HTML](docs/system-map.html) | Diagram of how the parts fit together. |
| [context.md](context.md) | Logic and design decisions behind the app. |
| [Assessment brief](NEWITY_Assessment_B_Lender_Comparison.docx) | The original assignment. |

### AI workflow journal

**Site:** https://newity-ai-workflow.dbzabhilash.chatgpt.site

The site is built from these exported chats:

- [SBA loan exploration](workflow%20chats%20to%20be%20exported/SBA-Loan-Exploration.md)
- [Architecture](workflow%20chats%20to%20be%20exported/Newity%20Loan%20Matcher%20architecture.md)
- [Design](workflow%20chats%20to%20be%20exported/Newity%20Loan%20Matcher%20design.md)
- [Login system and loan product tracking](workflow%20chats%20to%20be%20exported/Login%20system%20and%20loan%20product%20tracking%20(2).md)
- [Sales manager dashboard](workflow%20chats%20to%20be%20exported/Loan%20Matcher%20sales%20manager%20dashboard.md)
- [QA plan](workflow%20chats%20to%20be%20exported/Project%20QA%20plan.md)
