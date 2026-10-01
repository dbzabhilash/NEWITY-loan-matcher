import { fmtK, fmtMoney, payment, totalInterest, yearsMonths } from "./money";
import type { Bucket, Intake, Match, Program, RuleId, RuleResult, RuleStatus, Tier } from "./types";

const na = (id: RuleId, hard = false): RuleResult => ({ id, status: "n/a", hard, reason: "" });
const res = (id: RuleId, hard: boolean, status: RuleStatus, reason: string, extra: Partial<RuleResult> = {}): RuleResult => ({
  id,
  hard,
  status,
  reason,
  ...extra,
});

export function debtRatio(i: Intake): number | null {
  if (i.debtPayments == null || i.cashFlow == null) return null;
  if (i.cashFlow <= 0) return Infinity;
  return i.debtPayments / (i.cashFlow / 12);
}

export function monthsInBusiness(i: Intake): number | null {
  if (i.years == null && i.months == null) return null;
  return (i.years ?? 0) * 12 + (i.months ?? 0);
}

const yrsLabel = (m: number) => {
  const y = Math.floor(m / 12), mo = m % 12;
  return mo ? `${y} yrs ${mo} mos` : `${y} yrs`;
};

function special(p: Program, i: Intake): RuleResult {
  if (!p.special) return na("special");
  const id: RuleId = "special";
  const t = p.special.text;
  switch (p.special.key) {
    case "six_months": {
      const m = monthsInBusiness(i);
      if (m == null) return res(id, true, "unknown", t, { gap: "years", ask: "How long has the business been operating?" });
      return m >= 6 ? res(id, true, "pass", "Past the 6-month operating minimum") : res(id, true, "fail", "Needs 6+ months in business");
    }
    case "injection_10": {
      const base = i.requestedAmount; // design: "Injection is 11.1% of loan"
      if (i.ownerInjection == null || base == null)
        return res(id, true, "unknown", t, { gap: "ownerInjection", ask: "How much can the owner put in?" });
      const pct = (i.ownerInjection / base) * 100;
      return pct >= 10
        ? res(id, true, "pass", `Injection is ${pct.toFixed(1)}% — of loan — clears the 10% owner-injection rule`)
        : res(id, true, "fail", `Injection is ${pct.toFixed(1)}% — lender wants 10%`);
    }
    case "positive_cash_flow":
      if (i.cashFlow == null) return res(id, true, "unknown", t, { gap: "cashFlow", ask: "What's the yearly profit or cash flow?" });
      return i.cashFlow > 0 ? res(id, true, "pass", "Positive cash flow shown") : res(id, true, "fail", "Lender requires positive cash flow");
    case "franchise_sba":
      if (i.franchise == null) return res(id, false, "unknown", t, { gap: "franchise", ask: "Is the business a franchise?" });
      return i.franchise === "No" ? na("special") : res(id, false, "watch", "Franchise must be on the SBA directory — confirm listing");
    case "owner_occupied_only":
      if (i.purpose == null) return res(id, true, "unknown", t, { gap: "purpose", ask: "What is the loan for?" });
      if (i.purpose !== "Real estate purchase") return res(id, true, "fail", "Owner-occupied real estate only");
      if (i.ownerOccupied == null) return res(id, true, "unknown", t, { gap: "ownerOccupied", ask: "Will the business occupy the property?" });
      return i.ownerOccupied === "Yes" ? res(id, true, "pass", "Owner-occupied purchase qualifies") : res(id, true, "fail", "Owner-occupied real estate only");
    case "real_estate_only":
      if (i.purpose == null) return res(id, true, "unknown", t, { gap: "purpose", ask: "What is the loan for?" });
      return i.purpose === "Real estate purchase" ? res(id, true, "pass", "Real estate purchase qualifies") : res(id, true, "fail", "Real estate purchase only");
    case "equity_20":
      if (i.ownershipPct == null)
        return res(id, true, "unknown", "Owner must hold a 20%+ equity stake", { gap: "ownershipPct", ask: "What share of the business do you own?" });
      return i.ownershipPct >= 20 ? res(id, true, "pass", `${i.ownershipPct}% ownership clears the 20% equity rule`) : res(id, true, "fail", "Owner must hold 20%+ equity");
    case "no_bankruptcy":
      if (i.bankruptcy == null)
        return res(id, true, "unknown", "No bankruptcies in the last 7 years", { gap: "bankruptcy", ask: "Any bankruptcy in the last seven years?" });
      return i.bankruptcy === "No" ? res(id, true, "pass", "No bankruptcy in the last 7 years") : res(id, true, "fail", "Recent bankruptcy blocks this program");
    case "business_plan_startup": {
      const m = monthsInBusiness(i);
      if (m == null) return res(id, false, "unknown", t, { gap: "years", ask: "How long has the business been operating?" });
      return m >= 12 ? na("special") : res(id, false, "watch", "Business plan required for startups (under a year in business)");
    }
    case "no_refi":
      if (i.purpose == null) return res(id, true, "unknown", t, { gap: "purpose", ask: "What is the loan for?" });
      if (i.purpose === "Refinance") return res(id, true, "fail", "Cannot be used for refinancing");
      return res(id, false, "watch", "Cannot be used for refinancing — confirm no part of the project is a refi");
  }
}

export function evaluate(p: Program, i: Intake): Match {
  const rules: RuleResult[] = [];
  const P = i.requestedAmount;

  // amount
  if (P == null) rules.push(res("amount", true, "unknown", "Loan amount", { gap: "requestedAmount" }));
  else if (P < p.minAmount) rules.push(res("amount", true, "fail", `${fmtMoney(P)} is below the ${fmtK(p.minAmount)} minimum`));
  else if (P > p.maxAmount) rules.push(res("amount", true, "fail", `${fmtMoney(P)} is above the ${fmtK(p.maxAmount)} maximum`));
  else rules.push(res("amount", true, "pass", `${fmtMoney(P)} sits inside the ${fmtK(p.minAmount)}–${fmtK(p.maxAmount)} range`));

  // industry
  if (p.industry == null) rules.push(res("industry", true, "pass", "Open to all industries"));
  else if (i.industry == null) rules.push(res("industry", true, "unknown", "Industry", { gap: "industry" }));
  else if (i.industry === p.industry) rules.push(res("industry", true, "pass", `${i.industry.replace("/", " / ")} is an eligible industry`));
  else rules.push(res("industry", true, "fail", `${p.industry.replace("/", " / ")} only`));

  // credit
  if (i.creditScore == null) rules.push(res("credit", true, "unknown", "Credit score", { gap: "creditScore" }));
  else if (i.creditScore >= p.minCredit) rules.push(res("credit", true, "pass", `Est. credit ${i.creditScore}+ clears the ${p.minCredit} floor`));
  else rules.push(res("credit", true, "fail", `Needs ${p.minCredit}+ credit (est. ${i.creditScore < 600 ? "below 600" : `${i.creditScore}+`})`));

  // years
  const m = monthsInBusiness(i);
  if (m == null) rules.push(res("years", true, "unknown", "Time in business", { gap: "years" }));
  else if (p.minYears === 0) rules.push(res("years", true, "pass", "No time-in-business minimum"));
  else if (m / 12 >= p.minYears) rules.push(res("years", true, "pass", `${yrsLabel(m)} in business clears the ${p.minYears}-year minimum`));
  else rules.push(res("years", true, "fail", `Needs ${p.minYears} yr${p.minYears > 1 ? "s" : ""} in business`));

  // debt ratio
  if (p.maxDebtRatio == null) rules.push(na("debt_ratio", true));
  else {
    const dr = debtRatio(i);
    if (dr == null) rules.push(res("debt_ratio", true, "unknown", "Debt ratio", { gap: "debtPayments" }));
    else if (dr <= p.maxDebtRatio) rules.push(res("debt_ratio", true, "pass", `Debt ratio ${dr.toFixed(2)} under the ${p.maxDebtRatio} cap (calculated, not asked)`));
    else rules.push(res("debt_ratio", true, "fail", `Debt ratio ${isFinite(dr) ? dr.toFixed(2) : "∞"} over the ${p.maxDebtRatio} cap`));
  }

  // turnaround
  if (i.targetDays == null) rules.push(na("turnaround"));
  else if (p.turnaroundDays <= i.targetDays) rules.push(res("turnaround", false, "pass", `${p.turnaroundDays}-day turnaround lands inside the ${i.targetDays}-day target`));
  else rules.push(res("turnaround", false, "fail", `${p.turnaroundDays} days vs. ${i.targetDays}-day target`));

  // payment vs. target is informational (ranking + summary), not a rule — design keeps over-target programs "Strong fit".
  const pmt = P != null ? payment(P, p.rateMid, p.maxTerm) : null;

  // collateral
  if (p.collateral === "Yes" && !i.collateral.trim()) rules.push(res("collateral", false, "watch", "Collateral required — none listed yet"));
  else rules.push(na("collateral"));

  rules.push(special(p, i));

  // A watch item is a known rule the rep must confirm — it counts, and counts as passing ("7 of 7").
  const counted = rules.filter((r) => r.status !== "n/a");
  const hardFail = rules.some((r) => r.hard && r.status === "fail");
  const softFail = rules.some((r) => !r.hard && r.status === "fail");
  const unknown = rules.some((r) => r.status === "unknown");
  // Too slow beats "one answer away": a program that misses the deadline isn't worth an open question.
  const tier: Tier = hardFail ? "ineligible" : softFail ? "poor" : unknown ? "potential" : "strong";

  // Best-fit score (lower = better): ~20 days of waiting ≈ 1 pt of rate; 15% over the payment target ≈ 1 pt;
  // ½ pt of friction for any special condition or collateral watch ("simplest file" wins ties).
  const friction = (p.special ? 1 : 0) + (rules.some((r) => r.id === "collateral" && r.status === "watch") ? 1 : 0);
  let score = p.rateMid + 0.05 * p.turnaroundDays + 0.5 * friction;
  if (pmt != null && i.desiredPayment) score += (6.5 * Math.max(0, pmt - i.desiredPayment)) / i.desiredPayment;

  return {
    program: p,
    tier,
    score,
    rules,
    passed: counted.filter((r) => r.status === "pass" || r.status === "watch").length,
    total: counted.length,
    payment: pmt,
    paymentLow: P != null ? payment(P, p.rateMin, p.maxTerm) : null,
    paymentHigh: P != null ? payment(P, p.rateMax, p.maxTerm) : null,
    totalInterest: P != null ? totalInterest(P, p.rateMid, p.maxTerm) : null,
    bucket: tier === "strong" || tier === "potential" ? null : bucketOf(rules),
  };
}

/** First blocking reason wins: property-only > industry > amount/credit > too slow. */
function bucketOf(rules: RuleResult[]): Bucket {
  const failed = (id: RuleId) => rules.find((r) => r.id === id && r.status === "fail");
  const sp = failed("special");
  if (sp && /real estate/i.test(sp.reason)) return "property-only";
  if (failed("industry")) return "wrong industry";
  if (failed("amount") || failed("credit")) return "amount / credit";
  if (failed("turnaround")) return "too slow";
  return "other";
}

/** Human "why it's blocked" for pickers and lists. */
export function blockReason(m: Match): string {
  const f = m.rules.find((r) => r.hard && r.status === "fail") ?? m.rules.find((r) => r.status === "fail");
  if (f) return shortReason(f, m);
  const u = m.rules.find((r) => r.status === "unknown");
  if (u) return `needs ${gapLabel(u.gap)}`;
  return "";
}

function shortReason(r: RuleResult, m: Match): string {
  const p = m.program;
  switch (r.id) {
    case "credit": return `needs ${p.minCredit}+ credit`;
    case "industry": return `${p.industry} only`;
    case "amount": return `${fmtK(p.minAmount)}–${fmtK(p.maxAmount)} range`;
    case "years": return `needs ${p.minYears} yrs`;
    case "debt_ratio": return `ratio > ${p.maxDebtRatio}`;
    case "turnaround": return `${p.turnaroundDays} days`;
    case "special": return r.reason.toLowerCase().replace(/[.!]$/, "");
    default: return r.reason;
  }
}

export function gapLabel(gap?: keyof Intake): string {
  switch (gap) {
    case "ownershipPct": return "ownership %";
    case "bankruptcy": return "bankruptcy answer";
    case "ownerOccupied": return "owner-occupancy";
    case "purpose": return "loan purpose";
    case "years": return "time in business";
    case "creditScore": return "credit score";
    case "requestedAmount": return "loan amount";
    case "industry": return "industry";
    case "debtPayments": return "debt + cash flow";
    case "cashFlow": return "cash flow";
    case "ownerInjection": return "owner injection";
    case "franchise": return "franchise answer";
    default: return "an answer";
  }
}

export const RULE_LABEL: Record<RuleId, string> = {
  amount: "Loan amount in range",
  industry: "Industry eligible",
  credit: "Credit score",
  years: "Time in business",
  debt_ratio: "Debt ratio",
  turnaround: "Funding speed vs. target",
  collateral: "Collateral",
  special: "Special condition",
};

export { yearsMonths };

export interface Blocker {
  id: RuleId;
  /** Programs that would pass every hard rule if this one field changed. */
  unlocks: number;
  /** Total programs failing this rule. */
  failing: number;
  /** "at least what" — the loosest requirement among the programs this field alone blocks (or all failing, when none are one-away). */
  requirement: string;
}

/** Why nothing matches: which single field is doing the disqualifying, and the minimum it would need to be. */
export function diagnose(matches: Match[], i: Intake): Blocker[] {
  const hardIds: RuleId[] = ["amount", "industry", "credit", "years", "debt_ratio", "special"];
  const out: Blocker[] = [];
  for (const id of hardIds) {
    const failing = matches.filter((m) => m.rules.some((r) => r.id === id && r.status === "fail"));
    if (!failing.length) continue;
    const oneAway = failing.filter((m) => m.rules.filter((r) => r.hard && (r.status === "fail" || r.status === "unknown")).length === 1);
    const pool = oneAway.length ? oneAway : failing;
    out.push({ id, unlocks: oneAway.length, failing: failing.length, requirement: requirement(id, pool, i) });
  }
  return out.sort((a, b) => b.unlocks - a.unlocks || b.failing - a.failing);
}

function requirement(id: RuleId, pool: Match[], i: Intake): string {
  const ps = pool.map((m) => m.program);
  switch (id) {
    case "amount": {
      const P = i.requestedAmount ?? 0;
      const nearest = ps.reduce((a, b) => (Math.min(Math.abs(P - a.minAmount), Math.abs(P - a.maxAmount)) <= Math.min(Math.abs(P - b.minAmount), Math.abs(P - b.maxAmount)) ? a : b));
      return `nearest range is ${fmtK(nearest.minAmount)}–${fmtK(nearest.maxAmount)} (asked ${fmtMoney(P)})`;
    }
    case "industry": {
      const inds = [...new Set(ps.map((p) => p.industry).filter((x): x is string => !!x))];
      return `these lend to ${inds.map((x) => x.replace("/", " / ")).join(", ")} (customer: ${i.industry?.replace("/", " / ") ?? "—"})`;
    }
    case "credit":
      return `at least ${Math.min(...ps.map((p) => p.minCredit))} (customer est. ${i.creditScore == null ? "—" : i.creditScore < 600 ? "below 600" : `${i.creditScore}+`})`;
    case "years": {
      const min = Math.min(...ps.map((p) => p.minYears));
      const m = monthsInBusiness(i);
      return `at least ${min} yr${min === 1 ? "" : "s"} (customer ${m == null ? "—" : yrsLabel(m)})`;
    }
    case "debt_ratio": {
      const max = Math.max(...ps.map((p) => p.maxDebtRatio ?? 0));
      const dr = debtRatio(i);
      return `at most ${max} (customer ${dr == null ? "—" : isFinite(dr) ? dr.toFixed(2) : "∞"}) — lower debt payments or higher cash flow`;
    }
    case "special": {
      const reasons = [...new Set(pool.map((m) => m.rules.find((r) => r.id === "special" && r.status === "fail")?.reason).filter(Boolean))];
      return reasons.join("; ");
    }
    default:
      return "";
  }
}

export const BLOCKER_FIELD: Record<RuleId, string> = {
  amount: "Requested amount",
  industry: "Industry",
  credit: "Est. credit score",
  years: "Time in business",
  debt_ratio: "Debt ratio",
  turnaround: "Target funding",
  collateral: "Collateral",
  special: "Special conditions",
};
