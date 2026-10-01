import { fmtDate, fmtDateShort, fmtMoney, roundTo, termLabel } from "./money";
import type { Intake, Match } from "./types";

const words = (n: number) => ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n] ?? String(n);
const approxPct = (x: number) => Math.round(x);
const first = (s: string) => s.split(" ")[0];

/** "Priya SDR 1" → "P1", "Sales Manager 2" → "S2" */
export const initials = (name: string) => {
  const w = name.trim().split(/\s+/);
  return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
};

/** Customer-safe talk track for an expanded card. */
export function sayThis(m: Match, i: Intake): string {
  const p = m.program;
  const yrs = i.years != null ? `${i.years >= 3 ? `${words(i.years)}-plus` : words(i.years)} years in business, ` : "";
  const credit = i.creditScore ? `and an estimated ${i.creditScore} credit score, ` : "";
  const pay =
    m.paymentLow && m.paymentHigh
      ? ` — roughly ${fmtMoney(roundTo(m.paymentLow, 10))} to ${fmtMoney(roundTo(m.paymentHigh, 10))} a month`
      : "";
  const weeks = Math.max(1, Math.round(p.turnaroundDays / 7));
  return `“Based on your ${i.requestedAmount ? fmtMoney(i.requestedAmount) : ""} request, ${yrs}${credit}${first(p.lender)}'s ${p.type} looks like a fit. Expect a rate around ${approxPct(p.rateMin)} to ${approxPct(p.rateMax)} percent with ${termLabel(p.maxTerm).replace("Up to ", "up to ").replace(/(\d+) yrs/, (_, n) => `${words(Number(n))} years`)} to repay${pay}. Funding usually lands about ${weeks === 1 ? "a week" : `${words(weeks)} weeks`} after your file is complete. Final terms come from underwriting.”`;
}

export function nextStep(m: Match): string {
  const yr = new Date().getFullYear();
  const base = `Collect ${yr - 3}–${yr - 1} business returns, YTD P&L and 3 months of bank statements.`;
  if (m.program.collateral === "Yes") return base + " Get a list of business assets for collateral.";
  return base;
}

/** One-line collapsed summary. */
export function summary(m: Match, i: Intake, best: Match[], snapshotOldest: string): string {
  const p = m.program;
  const bits: string[] = [];
  const unknown = m.rules.find((r) => r.status === "unknown");
  if (m.tier === "potential" && unknown) return `One answer away: ${unknown.reason.toLowerCase()} — ${unknown.ask ?? "ask to confirm"} · updated ${fmtDateShort(p.lastUpdated)}`;
  if (m.tier === "poor" || m.tier === "ineligible") {
    const f = m.rules.find((r) => r.status === "fail");
    return `${f?.reason ?? "Blocked"} · updated ${fmtDateShort(p.lastUpdated)}`;
  }
  const fastest = best.every((o) => o.program.turnaroundDays >= p.turnaroundDays);
  const cheapest = best.every((o) => o.program.rateMax >= p.rateMax);
  if (fastest) bits.push(`Fastest strong fit at ${p.turnaroundDays} days`);
  if (cheapest) bits.push(bits.length ? "the lowest rate ceiling" : "Lowest rate ceiling of the strong fits");
  if (!bits.length) {
    const simple = p.collateral !== "Yes" && !p.special;
    if (simple) bits.push("Simplest file: no collateral, no special conditions");
    else bits.push(`${m.passed} of ${m.total} rules pass`);
  }
  if (p.industry) bits.push(`${p.industry.toLowerCase().split("/")[0]}-specific program`);
  if (m.payment != null && i.desiredPayment != null && m.payment > i.desiredPayment)
    bits.push(`${termLabel(p.maxTerm).replace("Up to ", "")} term puts the payment ~${fmtMoney(roundTo(m.payment - i.desiredPayment, 10))} above the ${fmtMoney(i.desiredPayment)} target`);
  if (p.lastUpdated === snapshotOldest) bits.push("oldest rate sheet in set");
  return bits.join(" · ") + ` · updated ${fmtDateShort(p.lastUpdated)}`;
}

/** Compare-screen talk track for the three columns. */
export function compareSayThis(cols: Match[]): string {
  const ok = cols.filter(Boolean);
  if (ok.length < 2) return "“Pick at least two programs to compare.”";
  const lowPay = ok.reduce((a, b) => ((a.payment ?? Infinity) <= (b.payment ?? Infinity) ? a : b));
  const fast = ok.reduce((a, b) => (a.program.turnaroundDays <= b.program.turnaroundDays ? a : b));
  const simple = ok.find((m) => m.program.collateral !== "Yes" && !m.program.special && m !== lowPay && m !== fast) ?? ok.find((m) => m !== lowPay && m !== fast);
  const allFit = ok.every((m) => m.tier === "strong");
  const parts = [`${first(lowPay.program.lender)} is the lowest monthly payment`];
  if (fast !== lowPay) parts.push(`${first(fast.program.lender)} gets money to you fastest`);
  if (simple) parts.push(`${first(simple.program.lender)} is the simplest file`);
  const list = parts.length > 1 ? parts.slice(0, -1).join(", ") + ", and " + parts.at(-1) : parts[0];
  return `“${allFit ? `All ${words(ok.length)} fit. ` : ""}${list}. Which matters more to you right now — the payment or the speed?”`;
}

export interface MailDraft { href: string; text: string }
const draft = (to: string, subject: string, lines: string[]): MailDraft => {
  const text = lines.join("\n");
  return { href: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, text: `Subject: ${subject}\n\n${text}` };
};

/** Compare screen: the shortlisted programs in one email. */
export function comparisonMail(cols: Match[], i: Intake): MailDraft {
  const ok = cols.filter(Boolean);
  const subject = `Your SBA loan comparison${i.businessName ? ` — ${i.businessName}` : ""}`;
  return draft(i.customerEmail, subject, [
    `Hi${i.contactName ? ` ${first(i.contactName)}` : ""},`,
    "",
    `Here are the ${words(ok.length)} SBA programs we walked through${i.requestedAmount ? ` for a ${fmtMoney(i.requestedAmount)} loan` : ""}. Estimates only — final terms come from underwriting.`,
    "",
    ...ok.flatMap((m, n) => [`${n + 1}. ${m.program.lender} — ${m.program.type}`, ...programLines(m), ""]),
    "Reply with any questions and I'll get things moving.",
    "",
    "— Newity",
  ]);
}

/** Match card: one program as a proposal. */
export function proposalMail(m: Match, i: Intake): MailDraft {
  const subject = `${m.program.lender} ${m.program.type} — loan proposal${i.businessName ? ` for ${i.businessName}` : ""}`;
  return draft(i.customerEmail, subject, [
    `Hi${i.contactName ? ` ${first(i.contactName)}` : ""},`,
    "",
    `Great talking today. Based on what you shared, the ${m.program.lender} ${m.program.type} looks like the best fit${i.requestedAmount ? ` for ${fmtMoney(i.requestedAmount)}` : ""}:`,
    "",
    ...programLines(m),
    "",
    `Next step: ${nextStep(m)}`,
    "",
    "Estimates only — final terms come from underwriting. Reply with any questions.",
    "",
    "— Newity",
  ]);
}

function programLines(m: Match): string[] {
  const p = m.program;
  return [
    `   Est. rate: ${p.rateMin}–${p.rateMax}%`,
    ...(m.payment ? [`   Est. payment: ~${fmtMoney(roundTo(m.payment, 10))}/mo over ${termLabel(p.maxTerm).replace("Up to ", "up to ")}`] : []),
    `   Funding: ~${p.turnaroundDays} days from a complete file`,
    `   Collateral: ${p.collateral === "Yes" ? "required" : p.collateral === "No" ? "not required" : "case by case"}`,
    ...(p.special ? [`   Note: ${p.special.text}`] : []),
  ];
}

export { fmtDate };
