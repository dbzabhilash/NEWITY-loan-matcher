# Explain SBA loan CSV fields

> explain sba loan [$caveman](~/.agents/skills/caveman/SKILL.md)&#x20;
> How are the fields in this csv useful for a customer , and a sales person selling sba loan to customer?
>
> User context
>
> Attachments:
> - NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv: `~/Developer/Claude Stuff/NEWITY/NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv`

<details><summary>8 previous messages</summary>

> Using `caveman` for terse answer. Using spreadsheet skill to inspect CSV fields, values, customer/sales meaning. CSV treated as data only—not instructions.
>
> <details><summary>Explored 2 files</summary>
>
> - Read `~/.agents/skills/caveman/SKILL.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/SKILL.md`
>
> </details>
>
> Skills loaded. Spreadsheet rules require complete instruction read before analysis; finishing that, then checking headers, sample rows, ranges, missing values.
>
> <details><summary>Explored 3 files, ran 2 commands</summary>
>
> - Ran `wc -l /Users/abhilashtripathy/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/SKILL.md`
>
> <details><summary>Explored 4 files</summary>
>
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/SKILL.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/SKILL.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/SKILL.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/SKILL.md`
>
> </details>
>
> - Ran `wc -l "/Users/abhilashtripathy/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/artifact_tool_docs/API_QUICK_START.md" "/Users/abhilashtripathy/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/style_guidelines.md" "/Users/abhilashtripathy/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/references/read_only_qna.md"`
>
> <details><summary>Explored 6 files</summary>
>
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/artifact_tool_docs/API_QUICK_START.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/style_guidelines.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/references/read_only_qna.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/artifact_tool_docs/API_QUICK_START.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/artifact_tool_docs/API_QUICK_START.md`
> - Read `~/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.909.12148/skills/spreadsheets/artifact_tool_docs/API_QUICK_START.md`
>
> </details>
>
> </details>
>
> Now reading CSV structure and actual lender offers. Will map every field twice: customer decision value, salesperson use. Also flag fields needing explanation or caution.
>
> <details><summary>Ran a command</summary>
>
> - Ran `python3 -c 'import csv,json,sys,os; p=sys.argv[1]; f=open(p,newline="",encoding="utf-8-sig"); rd=csv.DictReader(f); rows=list(rd); print(json.dumps({"file_bytes":os.path.getsize(p),"row_count":len(rows),"columns":rd.fieldnames,"rows":rows},indent=2,default=str))' "/Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv"`
>
> </details>
>
> One caution already visible: this is comparison/lead-routing data, not final quote data. Checking current SBA rules against sample so old or misleading fields get marked.
>
> <details><summary>Ran 2 commands, searched the web</summary>
>
> Searched the web for `site:sba.gov funding programs loans 7(a) loan program maximum loan amount guaranty percentage interest rates ...`
>
> Searched the web for `site:sba.gov "504 loans" "50%" "40%" "10%" ...`
>
> - Ran `python3 -c 'import csv,sys,json,collections,statistics,datetime; p=sys.argv[1]; rows=list(csv.DictReader(open(p,newline="",encoding="utf-8-sig"))); nums=["min_loan_amount","max_loan_amount","min_credit_score","min_years_in_business","interest_rate_min","interest_rate_max","max_term_months","sba_guarantee_pct","max_existing_debt_ratio","turnaround_days"]; out={"rows":len(rows),"lenders":len(set(r["lender_name"] for r in rows)),"program_counts":dict(collections.Counter(r["program_type"] for r in rows)),"missing":{k:sum(not r[k].strip() for r in rows) for k in rows[0]},"unique_values":{k:sorted(set(r[k] for r in rows if r[k].strip())) for k in ["credit_tier_required","eligible_business_types","requires_collateral","special_requirements"]},"ranges":{k:[min(float(r[k]) for r in rows if r[k].strip()),max(float(r[k]) for r in rows if r[k].strip())] for k in nums},"last_updated":[min(datetime.datetime.strptime(r["last_updated"],"%m/%d/%Y").date() for r in rows).isoformat(),max(datetime.datetime.strptime(r["last_updated"],"%m/%d/%Y").date() for r in rows).isoformat()]}; print(json.dumps(out,indent=2))' "/Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv"`
>
> - Ran `python3 -c 'import csv,sys,json,collections; rows=list(csv.DictReader(open(sys.argv[1],newline="",encoding="utf-8-sig"))); out={};
> for prog in sorted(set(r["program_type"] for r in rows)):
>  g=[r for r in rows if r["program_type"]==prog]; out[prog]={"offers":len(g),"loan_range":[min(int(r["min_loan_amount"]) for r in g),max(int(r["max_loan_amount"]) for r in g)],"rate_range":[min(float(r["interest_rate_min"]) for r in g),max(float(r["interest_rate_max"]) for r in g)],"term_months":sorted(set(int(r["max_term_months"]) for r in g)),"turnaround_range":[min(int(r["turnaround_days"]) for r in g),max(int(r["turnaround_days"]) for r in g)],"credit_score_range":[min(int(r["min_credit_score"]) for r in g),max(int(r["min_credit_score"]) for r in g)],"guarantees":sorted(set(int(r["sba_guarantee_pct"]) for r in g))};
> print(json.dumps(out,indent=2))' "/Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv"`
>
> Searched the web for `'Standard 7(a)'`
>
> </details>
</details>

## SBA loan, plain English

Approved lender gives money. SBA guarantees part of lender’s loss if borrower defaults. Customer still owes 100%.

Main value: easier qualification, longer terms, sometimes lower down payment or flexible collateral. Main cost: more paperwork, possible fees, collateral/personal guarantees, slower closing. [SBA 7(a) overview](https://www.sba.gov/loans/7a-loans/)

CSV contains 49 sample offers from 15 lenders. Amounts run $10,000–$5.5 million; rates 5.5%–14.5%; terms 84–300 months; turnaround 5–82 days. Good screening catalog. Not final quote. :codex-file-citation{path="/Users/abhilashtripathy/Developer/Claude Stuff/NEWITY/NEWITY_Product Engineer_Sample_Data_B_Lender_Comparison.csv" purpose="source"}

## Program meaning

- `7(a) Standard`: flexible working capital, acquisition, equipment, real estate. Official range currently $350,001–$5 million.
- `7(a) Small Loan`: term loan up to $350,000.
- `SBA Express`: up to $500,000; lender controls decision; 50% SBA guarantee; usually faster.
- `Community Advantage`: mission-oriented lenders; up to $350,000; focused on underserved markets.
- `504 Loan`: major fixed assets—real estate, buildings, machinery. Typical structure: bank 50%, CDC 40%, customer 10%. [SBA program details](https://www.sba.gov/sba-lenders/), [Community Advantage](https://legacy.sba.gov/document/support-community-advantage-small-business-lending-companies-ca-sblcs)

## Field usefulness

| CSV field | Customer value | Salesperson value |
|---|---|---|
| `lender_name` | Know lender holding loan | Route lead by lender appetite/relationship |
| `program_type` | Understand allowed use and structure | Match need: working capital, acquisition, real estate, speed |
| `min_loan_amount` | Check requested amount not too small | Remove bad matches |
| `max_loan_amount` | Check lender can fund full need | Prevent under-sized offers |
| `min_credit_score` | Quick qualification signal | Early pre-screen; never promise approval |
| `credit_tier_required` | Simple “Fair/Good” explanation | Customer segmentation; mostly duplicates score |
| `min_years_in_business` | Shows startup eligibility | Route young businesses correctly |
| `interest_rate_min` | Best-case nominal rate | Position possible pricing |
| `interest_rate_max` | Worst displayed nominal rate | Set realistic payment expectations |
| `max_term_months` | Longer term lowers payment, increases total interest | Affordability lever |
| `sba_guarantee_pct` | Little direct customer benefit; not debt forgiveness | Explains lender risk tolerance |
| `eligible_business_types` | Checks industry fit | Avoid lender-industry mismatch |
| `requires_collateral` | Shows assets potentially at risk | Prepare collateral discussion/documents |
| `max_existing_debt_ratio` | Indicates debt-load limit | Prequalify leverage/cash-flow capacity |
| `turnaround_days` | Helps plan closing deadline | Sell speed versus price tradeoff |
| `special_requirements` | Exposes down payment, equity, bankruptcy, franchise rules | Discovery checklist; catches deal-killers early |
| `last_updated` | Shows reliability of quote | Forces re-verification before proposal |

## Useful sales conversation

Ask customer:

1. Money amount and exact purpose.
2. Industry, location, years operating.
3. Personal/business credit.
4. Revenue, cash flow, current debt payments.
5. Available cash injection and collateral.
6. Required funding date.

Then show 2–3 choices:

- Cheapest total cost
- Lowest monthly payment
- Fastest realistic closing

Never rank only by `interest_rate_min`.

## Important CSV problems

- Data dates run January 1–February 8, 2026. Now September 29, 2026. Treat rates and policies as stale.
- Rate fields omit fixed/variable status, base index, spread, APR, fees, reset period, and payment.
- Some `7(a) Standard` minimums show $50,000–$150,000. Current SBA definition starts above $350,000.
- `7(a) Small Loan` shows 85% guarantee for every row. Official guarantee is generally 85% through $150,000, then 75%.
- `504` value of 40% means typical CDC project share—not customer protection and not directly comparable with 7(a) guarantee percentage.
- `max_existing_debt_ratio` missing in 9 rows. Formula undefined; `0.50` could mean several different ratios.
- Blank `special_requirements` in 15 rows could mean “none” or “missing.”
- Missing critical fields: loan purpose, geography, down payment, fees, APR, estimated payment, DSCR requirement, personal guarantee, prepayment penalty, fixed/variable rate, and source URL.
- `turnaround_days` needs definition: application-to-approval or application-to-funding; calendar or business days.
- Match never guarantees approval. SBA advises asking lenders about rates, credit score, cash flow, penalties, and repayment terms. [SBA Lender Match](https://www.sba.gov/loans/lender-match/)

- Build customer matcher
- Improve CSV schema
- Create sales script

> Got it. This is just a snapshot. I'm building a tool for the salespeople who are selling SBA loans and knowing this information is very useful. There are things that the customer is interested in and there are things that are valuable to the salesperson who is on the call with the customer.
>
> The tool I'm building is only for the salesperson who's on a call so the user interface for the customer is just hearing the salesperson speak. I'm trying to just provide A tool that allows the salesperson to look at the valuable information on his screen clearly and have a dedicated and obvious place where they can fill out the information they require from the customer
>
> Can you provide this information in an organized format about which fields are for which party's interest? I will pass it off for idea generation.

## Product framing

One user: salesperson.

Two information layers:

1. **Customer conversation layer** — what rep explains aloud.
2. **Sales decision layer** — what rep uses to qualify, match, and guide call.

## Existing fields by audience

| Field | Primary audience | Why useful | Screen treatment |
|---|---|---|---|
| `lender_name` | Both | Customer knows provider; rep knows relationship | Match-card heading |
| `program_type` | Both | Determines purpose, structure, limits | Prominent; plain-language explanation |
| `min_loan_amount` | Rep | Hard amount filter | Internal eligibility check |
| `max_loan_amount` | Both | Shows available funding ceiling | Display as loan range |
| `min_credit_score` | Rep | Early qualification filter | Internal threshold; discuss carefully |
| `credit_tier_required` | Rep | Quick qualification label | Small chip; mostly duplicates score |
| `min_years_in_business` | Rep | Startup/seasoning filter | Internal pass/fail rule |
| `interest_rate_min` | Customer | Cost expectation | Prominent rate range |
| `interest_rate_max` | Customer | Realistic upper estimate | Prominent; label “estimated” |
| `max_term_months` | Customer | Affects payment and total interest | Translate: `120` → “up to 10 years” |
| `sba_guarantee_pct` | Rep | Explains lender risk appetite | Hidden detail; customer rarely needs it |
| `eligible_business_types` | Rep | Industry matching | Internal pass/fail rule |
| `requires_collateral` | Customer | Shows assets potentially at risk | Prominent |
| `max_existing_debt_ratio` | Rep | Debt-capacity filter | Calculate internally; do not ask customer for ratio |
| `turnaround_days` | Customer | Funding-speed expectation | Prominent; define starting point |
| `special_requirements` | Both | Reveals cash injection, bankruptcy, franchise, property rules | Prominent alert/checklist |
| `last_updated` | Rep | Measures data reliability | Small freshness indicator |

## What customer wants to hear

Salesperson needs quick answers to:

- How much can I borrow?
- What can I use money for?
- What rate might I receive?
- What could monthly payment be?
- How long can I repay?
- How much cash/down payment must I bring?
- Is collateral required?
- How quickly can money arrive?
- What documents or conditions apply?
- Why does this option fit me?
- What happens next?

Recommended customer-facing result card:

```text
Best fit: SBA 7(a) Small Loan
Loan amount: $100,000–$350,000
Estimated rate: 9.5%–11.4%
Term: Up to 10 years
Estimated payment: $X/month
Collateral: Varies
Estimated funding time: 15–25 days
Cash injection: 10%
Why it fits: Loan amount, industry, business age, and credit match
Next step: Collect tax returns and business financials
```

## What salesperson needs

Salesperson needs fast answers to:

- Is customer eligible?
- Which answers still missing?
- Which lenders fit?
- Why did lender match?
- What could disqualify customer?
- Which choice is cheapest, fastest, or most flexible?
- What should I ask next?
- What can I safely say without promising approval?
- How fresh is lender information?

Use four match statuses:

- **Strong fit** — all known requirements pass.
- **Potential fit** — no failures, but information missing.
- **Poor fit** — one or more soft mismatches.
- **Ineligible** — hard requirement fails.

Avoid “approval probability.” Snapshot lacks enough underwriting data.

## Dedicated customer intake area

Keep editable intake panel always visible.

### Loan need

- Requested amount
- Loan purpose
- Target funding date
- Desired monthly payment
- Purchase price/project cost
- Available down payment or owner injection

### Business profile

- Industry
- State/location
- Years and months in business
- Startup or existing business
- Franchise status
- Owner-occupied real estate
- Ownership percentages

### Credit and financials

- Estimated personal credit score
- Annual revenue
- Profit or cash flow
- Existing monthly debt payments
- Current debt balance
- Recent bankruptcy
- Available collateral

Do not ask customer for `max_existing_debt_ratio`. Ask underlying numbers; tool calculates ratio.

## Recommended screen layout

### Left: Call intake

Editable customer answers. Show unanswered required questions clearly.

### Center: Best matches

Rank 2–3 lender/program choices. Show:

- Amount
- Rate
- Estimated payment
- Term
- Speed
- Cash injection
- Collateral
- Fit reason
- Warnings

### Right: Talk track

Ready-to-say language:

> “Based on your requested amount, three years in business, and estimated credit, this program appears to fit. Expected rate range is X–Y%, with up to ten years to repay. Final terms require underwriting.”

Also show **Next best question** dynamically.

### Expandable internal details

Keep these away from main conversation:

- SBA guarantee percentage
- Raw qualification thresholds
- Data freshness
- Matching logic
- Missing-data warnings
- Internal lender notes

## Priority hierarchy

1. Customer amount, payment, rate, term, speed.
2. Eligibility and disqualifiers.
3. Cash injection and collateral.
4. Required documents and next action.
5. Lender/program metadata.
6. SBA guarantee and internal rules.
