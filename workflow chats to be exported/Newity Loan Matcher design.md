# Newity Loan Matcher design

- **Session ID:** `220eae88-e7c4-47f1-8425-d4a7bb673968`
- **Started:** 2026-09-29 22:40
- **Last activity:** 2026-09-29 23:12
- **Prompts:** 2

> Tool calls Claude made are listed as 🔧 lines; tool outputs and internal reasoning are omitted.

---

## 🧑 Prompt · 2026-09-29 22:40

> From the files that are available in this folder, only look at the CSV, not the DOCX. 
> I was able to gather some insight about what kind of fields are going to be important if I'm trying to build out this sales tool that my salespeople can use while they are on a call with a customer seeking an SBA loan.
>
> The problem we're trying to solve is that the information lives in a lot of places. The CSV is a snapshot of the information that we have right now. We're just trying to build out a tool where a salesperson who's on a call can quickly type in information about the customer and can find what programs or loan offerings match the customer who is on the call. 
>
> Using these insights and the paper design MCP (call this design "Newity Loan Matcher", And try to look up the Newity company's color schemes and try to match that color scheme and design system), can you build out a design in which the salesperson can fill out the information of the customer that they are in a call with on the left side of the page, and immediately to the right, they can see what programs would fit the best. Here are the insights:
>
> <pasted_content id="e227">
> ## Product framing
>
> One user: salesperson.
>
> Two information layers:
>
> 1. **Customer conversation layer** — what rep explains aloud.
> 2. **Sales decision layer** — what rep uses to qualify, match, and guide call.
>
> ## Existing fields by audience
>
> | Field | Primary audience | Why useful | Screen treatment |
> |---|---|---|---|
> | `lender_name` | Both | Customer knows provider; rep knows relationship | Match-card heading |
> | `program_type` | Both | Determines purpose, structure, limits | Prominent; plain-language explanation |
> | `min_loan_amount` | Rep | Hard amount filter | Internal eligibility check |
> | `max_loan_amount` | Both | Shows available funding ceiling | Display as loan range |
> | `min_credit_score` | Rep | Early qualification filter | Internal threshold; discuss carefully |
> | `credit_tier_required` | Rep | Quick qualification label | Small chip; mostly duplicates score |
> | `min_years_in_business` | Rep | Startup/seasoning filter | Internal pass/fail rule |
> | `interest_rate_min` | Customer | Cost expectation | Prominent rate range |
> | `interest_rate_max` | Customer | Realistic upper estimate | Prominent; label “estimated” |
> | `max_term_months` | Customer | Affects payment and total interest | Translate: `120` → “up to 10 years” |
> | `sba_guarantee_pct` | Rep | Explains lender risk appetite | Hidden detail; customer rarely needs it |
> | `eligible_business_types` | Rep | Industry matching | Internal pass/fail rule |
> | `requires_collateral` | Customer | Shows assets potentially at risk | Prominent |
> | `max_existing_debt_ratio` | Rep | Debt-capacity filter | Calculate internally; do not ask customer for ratio |
> | `turnaround_days` | Customer | Funding-speed expectation | Prominent; define starting point |
> | `special_requirements` | Both | Reveals cash injection, bankruptcy, franchise, property rules | Prominent alert/checklist |
> | `last_updated` | Rep | Measures data reliability | Small freshness indicator |
>
> ## What customer wants to hear
>
> Salesperson needs quick answers to:
>
> - How much can I borrow?
> - What can I use money for?
> - What rate might I receive?
> - What could monthly payment be?
> - How long can I repay?
> - How much cash/down payment must I bring?
> - Is collateral required?
> - How quickly can money arrive?
> - What documents or conditions apply?
> - Why does this option fit me?
> - What happens next?
>
> Recommended customer-facing result card:
>
> ```text
> Best fit: SBA 7(a) Small Loan
> Loan amount: $100,000–$350,000
> Estimated rate: 9.5%–11.4%
> Term: Up to 10 years
> Estimated payment: $X/month
> Collateral: Varies
> Estimated funding time: 15–25 days
> Cash injection: 10%
> Why it fits: Loan amount, industry, business age, and credit match
> Next step: Collect tax returns and business financials
> ```
>
> ## What salesperson needs
>
> Salesperson needs fast answers to:
>
> - Is customer eligible?
> - Which answers still missing?
> - Which lenders fit?
> - Why did lender match?
> - What could disqualify customer?
> - Which choice is cheapest, fastest, or most flexible?
> - What should I ask next?
> - What can I safely say without promising approval?
> - How fresh is lender information?
>
> Use four match statuses:
>
> - **Strong fit** — all known requirements pass.
> - **Potential fit** — no failures, but information missing.
> - **Poor fit** — one or more soft mismatches.
> - **Ineligible** — hard requirement fails.
>
> Avoid “approval probability.” Snapshot lacks enough underwriting data.
>
> ## Dedicated customer intake area
>
> Keep editable intake panel always visible.
>
> ### Loan need
>
> - Requested amount
> - Loan purpose
> - Target funding date
> - Desired monthly payment
> - Purchase price/project cost
> - Available down payment or owner injection
>
> ### Business profile
>
> - Industry
> - State/location
> - Years and months in business
> - Startup or existing business
> - Franchise status
> - Owner-occupied real estate
> - Ownership percentages
>
> ### Credit and financials
>
> - Estimated personal credit score
> - Annual revenue
> - Profit or cash flow
> - Existing monthly debt payments
> - Current debt balance
> - Recent bankruptcy
> - Available collateral
>
> Do not ask customer for `max_existing_debt_ratio`. Ask underlying numbers; tool calculates ratio.
>
> ## Recommended screen layout
>
> ### Left: Call intake
>
> Editable customer answers. Show unanswered required questions clearly.
>
> ### Center: Best matches
>
> Rank 2–3 lender/program choices. Show:
>
> - Amount
> - Rate
> - Estimated payment
> - Term
> - Speed
> - Cash injection
> - Collateral
> - Fit reason
> - Warnings
>
> ### Right: Talk track
>
> Ready-to-say language:
>
> > “Based on your requested amount, three years in business, and estimated credit, this program appears to fit. Expected rate range is X–Y%, with up to ten years to repay. Final terms require underwriting.”
>
> Also show **Next best question** dynamically.
>
> ### Expandable internal details
>
> Keep these away from main conversation:
>
> - SBA guarantee percentage
> - Raw qualification thresholds
> - Data freshness
> - Matching logic
> - Missing-data warnings
> - Internal lender notes
>
> ## Priority hierarchy
>
> 1. Customer amount, payment, rate, term, speed.
> 2. Eligibility and disqualifiers.
> 3. Cash injection and collateral.
> 4. Required documents and next action.
> 5. Lender/program metadata.
> 6. SBA guarantee and internal rules.
> </pasted_content id="e227">


## 🤖 Claude

I'll read the CSV, load the Paper guide, and look up Newity's brand colors, then build the design.

- 🔧 `Bash` — List folder and print the CSV
- 🔧 `ToolSearch` — select:mcp__paper__get_guide,mcp__paper__get_basic_info,mcp__paper__list_files,mcp__paper__create_file,mcp__paper__create_page,mcp__paper__create_artboard,mcp__
- 🔧 `mcp__paper__get_guide`
- 🔧 `WebSearch` — Newity SBA lender newity.com brand colors
- 🔧 `WebFetch` — https://www.newity.com
- 🔧 `mcp__paper__list_files`
- 🔧 `WebFetch` — https://newitymarket.com/
- 🔧 `mcp__Claude_Browser__navigate` — https://newitymarket.com/
- 🔧 `mcp__paper__get_basic_info`
- 🔧 `mcp__Claude_Browser__javascript_tool`
- 🔧 `mcp__Claude_Browser__computer`
- 🔧 `mcp__paper__create_file`
- 🔧 `mcp__paper__get_font_family_info`
- 🔧 `mcp__paper__open_file`
- 🔧 `mcp__paper__create_tokens`
- 🔧 `mcp__paper__create_artboard`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`

Checkpoint screenshot while I keep adding the intake rows and the first match card.

- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`

Fixing the wrapping in the header pills and chips, then adding the business profile section and the key-numbers strip.

- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__get_screenshot`

Fixing button/label wraps, switching the artboard to fit-content, and adding the next-best-question card and the second match.

- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__duplicate_nodes`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__rename_nodes`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__delete_nodes`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__get_screenshot`

Needed: tighten the rep-only strip, save a project memory with the Paper file link and brand palette, verify, and release the artboard.

- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__update_styles`
- 🔧 `Bash` — Save project memory about the Paper file and brand palette
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__finish_working_on_nodes`

Done. The design is in Paper as **Newity Loan Matcher** → https://app.paper.design/file/01M3R6GMQ31N0RAQS77RYF0FGC (one 1440-wide artboard, "Live call").

**What's on the artboard**

- **Top bar**: NEWITY wordmark in brand cobalt, on-call pill with the customer, and the lender-snapshot freshness line (49 programs, 15 lenders, Feb 8, 2026).
- **Left rail — Call intake**: Loan need, Business profile, Credit & financials, all editable. Two open questions are flagged amber (ownership %, bankruptcy), the debt ratio is shown as *calculated, never asked*, and the injection helper tells the rep the $20k clears every 10% rule. A navy **Next best question** card sits at the bottom and says which program it unlocks.
- **Right — Matches**: status summary (10 strong · 2 potential · 9 poor · 28 ineligible), sort chips, then ranked cards. Card 1 (Frontier SBA Express) is expanded: seven customer numbers (amount, rate, ~$2,470/mo payment, term, 14 days, cash injection, collateral), "Why it fits" checklist, "Watch" warnings, a **Say this** talk track, next step, and a collapsible **Rep only** strip (SBA guarantee, thresholds, rate-sheet date). Cards 2–3 are compact strong fits, card 4 shows the **Potential fit** state, and a final block explains why the other 37 didn't match.

**Data**: every number is computed from the CSV for a sample customer (restaurant, IL, $180k, 3y 4m, credit 690), so the ranking and disqualifier counts are real, not lorem.

**Brand**: palette measured on newitymarket.com (cobalt `#0036F3`, ink `#0C1521`, navy `#15295A`, signal green `#75FF6F`, ground `#F5F5F7`) and saved as tokens in the file. Newity's actual fonts (Neue Haas Grotesk Display / Proxima Nova) aren't installed on your machine, so Inter is standing in; swap the `--font-sans` token once they are.

Sources: [NEWITY site](https://newitymarket.com/), [Newity review](https://www.finder.com/business-loans/newity-review)

---

## 🧑 Prompt · 2026-09-29 23:11

> * Add a compare view for the top 3 matches.
> * I would also like to see an affordability slider so that, for a particular program that is selected, they should be able to see, if they change their monthly payment a little bit, how soon they can pay it off. I would also like the total interest amount, just in case the customer is interested in the total interest that they will end up paying. 
>
>
> Do not supersede this design. I want you to iterate. Since I'm not sure how all of these things would fit, I want you to Give me two separate options:
>
> 1. Where you just add the comparison view of the top three matches. In this view, you should also allow the flexibility to choose the programs. You should not be able to choose the program that the customer is not eligible for.
> 2. One with the comparison, as well as the extra affordability slider, as well as total interest expected


## 🤖 Claude

Two new artboards, iterating on the original (which stays untouched): Option A adds a compare view with a program picker, Option B adds the affordability slider and total-interest figures on top of that. First the numbers, computed from the CSV rates.

- 🔧 `Bash` — Compute payments, payoff months and total interest for the top 3 programs
- 🔧 `mcp__paper__duplicate_nodes`
- 🔧 `mcp__paper__rename_nodes`
- 🔧 `mcp__paper__delete_nodes`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__move_nodes`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__duplicate_nodes`

Option A is done; now building Option B from it: closing the picker, marking Frontier as the selected program, adding a total-interest row, and starting the affordability panel.

- 🔧 `mcp__paper__rename_nodes`
- 🔧 `mcp__paper__delete_nodes`
- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__move_nodes`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__write_html`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `mcp__paper__update_styles`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__set_text_content`
- 🔧 `Bash` — Update project memory with the two new option artboards
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__get_screenshot`
- 🔧 `mcp__paper__finish_working_on_nodes`

Both options are on the canvas as new artboards next to the original, which is untouched. Same file: https://app.paper.design/file/01M3R6GMQ31N0RAQS77RYF0FGC

**Option A — Compare top 3**
- A **Ranked list | Compare** toggle replaces the sort chips. Compare mode swaps the cards for a side-by-side table: loan range, est. rate, est. payment, term, funding time, cash injection, collateral, special conditions, rate-sheet date, plus a rep-only thresholds row. The best value per row gets a LOWEST / FASTEST tag.
- Each column header is a **program picker**. Column 2 is shown open: eligible programs are grouped Strong / Potential / Poor, programs already in another column are greyed, and the 28 ineligible programs sit in a locked "can't be compared" group with the reason (needs 700+ credit, real estate only).
- Footer is a say-this line for the comparison plus Send comparison / Copy talk track.

**Option B — Compare + affordability**
- Same table plus a **Total interest (est.)** row: ~$116,900 / ~$124,900 / ~$77,700 at each program's minimum payment and mid rate.
- The selected column (Frontier, highlighted in cobalt) drives an **affordability panel** below: a payment slider from the $2,474 ten-year minimum up to $4,500, shown at $2,900, with three outcomes: paid off in 7 yrs 8 mo (2 yrs 4 mo sooner), total interest ~$86,800, interest saved ~$30,200. A baseline line and a say-this script sit beneath. Amortization math was computed from the CSV rates, not eyeballed.

One thing to decide: in both options the compare view replaces the ranked cards (via the toggle) rather than stacking under them, so the talk track for a single program lives in the ranked view. If you'd rather keep cards visible with compare pinned beneath, that's a layout swap I can make on either artboard.
