"use client";
import { Check, Chevron, Warn } from "@/components/icons";
import { MailLink } from "@/components/MailLink";
import { RulesPill, TierPill } from "@/components/RulesPill";
export { TIER_LABEL, TIER_PILL } from "@/components/RulesPill";
import { nextStep, proposalMail, sayThis, summary } from "@/lib/copy";
import { fmtDate, fmtK, fmtMoney, roundTo, termLabel } from "@/lib/money";
import type { Intake, Match } from "@/lib/types";
import { useState } from "react";


function Stat({ label, value, sub, blue, compact }: { label: string; value: string; sub: string; blue?: boolean; compact?: boolean }) {
  return (
    <div className={`flex min-w-0 basis-0 grow flex-col xl:border-l xl:border-border xl:first:border-l-0 xl:first:pl-0 xl:last:pr-0 ${compact ? "gap-[2px] py-[6px] xl:px-3" : "gap-1 py-2 xl:px-3 xl:py-3"}`}>
      <span className="whitespace-nowrap text-xs font-medium leading-4 text-muted">{label}</span>
      <span className={`whitespace-nowrap font-bold tracking-[-0.01em] ${compact ? "text-[16px] leading-[22px]" : "text-lg leading-6"} ${blue ? "text-blue" : ""}`}>{value}</span>
      <span className="truncate text-xs leading-4 text-muted">{sub}</span>
    </div>
  );
}

export function Stats({ m, i, compact }: { m: Match; i: Intake; compact?: boolean }) {
  const p = m.program;
  const injection = p.special?.key === "injection_10";
  return (
    <div className={`grid grid-cols-2 gap-x-3 sm:grid-cols-4 xl:flex xl:gap-0 ${compact ? "px-4 sm:px-6 pb-[14px]" : "px-4 sm:px-6 pb-5"}`}>
      <Stat compact={compact} label="Loan amount" value={i.requestedAmount ? fmtMoney(i.requestedAmount) : "—"} sub={`of ${fmtK(p.minAmount)}–${fmtK(p.maxAmount)}`} />
      <Stat compact={compact} label="Est. rate" value={`${p.rateMin}–${p.rateMax}%`} sub="estimated" />
      <Stat compact={compact} label="Est. payment" blue value={m.payment ? `~${fmtMoney(roundTo(m.payment, 10))}/mo` : "—"} sub={m.paymentLow && m.paymentHigh ? `${fmtMoney(roundTo(m.paymentLow, 10))}–${fmtMoney(roundTo(m.paymentHigh, 10))}` : "enter an amount"} />
      <Stat compact={compact} label="Term" value={termLabel(p.maxTerm)} sub={`${p.maxTerm} months`} />
      <Stat compact={compact} label="Funding time" value={`~${p.turnaroundDays} days`} sub="from complete file" />
      <Stat compact={compact} label="Cash injection" value={injection ? "10%" : "None"} sub={i.ownerInjection ? `${fmtK(i.ownerInjection)} on hand` : injection ? "owner injection" : "no rule listed"} />
      <Stat compact={compact} label="Collateral" value={p.collateral === "Yes" ? "Required" : p.collateral === "No" ? "Not required" : "Varies"} sub={p.collateral === "Varies" ? "case by case" : "per rate sheet"} />
    </div>
  );
}

export function MatchCard({
  m,
  i,
  rank,
  expanded,
  onToggle,
  onCompare,
  onOpenCompare,
  inCompare,
  compareFull,
  best,
  oldest,
}: {
  m: Match;
  i: Intake;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
  onCompare: () => void;
  onOpenCompare: () => void;
  inCompare: boolean;
  compareFull: boolean;
  best: Match[];
  oldest: string;
}) {
  const p = m.program;
  const [copied, setCopied] = useState(false);
  const passes = m.rules.filter((r) => r.status === "pass");
  const watches = m.rules.filter((r) => r.status === "watch" || r.status === "unknown" || r.status === "fail");
  const oldestSheet = p.lastUpdated === oldest;
  const talk = sayThis(m, i);
  const eligible = m.tier === "strong" || m.tier === "potential";

  const copy = () => {
    navigator.clipboard?.writeText(talk.replace(/[“”]/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const summaryIcon = m.tier === "strong" ? <Check /> : m.tier === "potential" ? <span className="flex size-4 items-center justify-center rounded-full bg-amber text-[10px] font-bold">?</span> : <Warn />;

  if (!expanded)
    return (
      <article className={`overflow-visible rounded-lg border bg-white ${inCompare ? "border-blue" : "border-border"} ${m.tier === "ineligible" ? "opacity-70" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pb-3 pt-4">
          <button type="button" onClick={onToggle} className="flex min-w-0 flex-wrap items-center gap-x-[14px] gap-y-1 text-left">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-ground text-sm font-bold">{rank}</span>
            <span className="shrink-0 text-[20px] font-bold leading-6 tracking-tight">{p.lender}</span>
            <span className="shrink-0 text-[14px] font-semibold leading-5 text-blue">{p.type}</span>
            <span className="hidden min-w-0 truncate text-[14px] leading-5 text-muted xl:inline">{p.typeBlurb}</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {inCompare && <InComparePill onOpen={onOpenCompare} />}
            <TierPill m={m} size="sm" />
            <RulesPill m={m} size="sm" />
          </div>
        </div>
        <Stats m={m} i={i} compact />
        <div className={`flex flex-col gap-2 rounded-b-lg border-t border-border px-4 sm:px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${m.tier === "potential" ? "bg-amber-soft" : "bg-ground"}`}>
          <div className="flex min-w-0 items-center gap-2 text-sm leading-[18px]">
            {summaryIcon}
            <span>{summary(m, i, best, oldest)}</span>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium leading-4">
            <button type="button" onClick={onToggle} className="font-semibold text-blue">
              Say this
            </button>
            <button type="button" onClick={onToggle} className="text-muted hover:text-ink">
              Rep details
            </button>
            <button type="button" onClick={onCompare} disabled={m.tier === "ineligible" || (!inCompare && compareFull)} title={!inCompare && compareFull ? "Compare is full (4)" : undefined} className={`hover:text-ink disabled:opacity-40 ${inCompare ? "font-semibold text-blue" : "text-muted"}`}>
              {inCompare ? "✓ Comparing · remove" : compareFull ? "Compare full" : "Compare"}
            </button>
          </div>
        </div>
      </article>
    );

  return (
    <article className={`overflow-visible rounded-lg border bg-white ${inCompare ? "border-blue" : "border-border"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pb-4 pt-5">
        <div className="flex min-w-0 items-start gap-4 pr-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue text-[14px] font-bold text-white">{rank}</span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xl font-bold leading-7 tracking-tight">{p.lender}</span>
            <span className="flex min-w-0 items-center gap-2 text-[14px] leading-5">
              <span className="shrink-0 font-semibold text-blue">{p.type}</span>
              <span className="min-w-0 truncate text-muted">{p.typeBlurb}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {inCompare && <InComparePill onOpen={onOpenCompare} size="md" />}
          <TierPill m={m} />
          <RulesPill m={m} />
        </div>
      </div>
      <Stats m={m} i={i} />
      <div className="flex flex-col items-stretch gap-4 border-t border-border px-4 sm:px-6 py-5 xl:flex-row xl:items-start xl:gap-6">
        {/* Left: rules */}
        <div className="flex min-w-0 basis-0 grow flex-col gap-2">
          <span className="label-caps text-muted">Why it fits</span>
          {passes.map((r) => (
            <span key={r.id + r.reason} className="flex items-center gap-2 text-[14px] leading-5">
              <Check />
              {r.reason}
            </span>
          ))}
          {(watches.length > 0 || oldestSheet) && (
            <>
              <span className="label-caps pt-2 text-amber">{m.tier === "ineligible" ? "Blocked" : "Watch"}</span>
              {watches.map((r) => (
                <span key={r.id + r.reason} className="flex items-start gap-2 text-[14px] leading-5">
                  <span className="pt-[2px]">
                    <Warn />
                  </span>
                  {r.status === "unknown" ? `${r.reason} — ${r.ask ?? "ask to confirm"}` : r.reason}
                </span>
              ))}
              {oldestSheet && (
                <span className="flex items-start gap-2 text-[14px] leading-5">
                  <span className="pt-[2px]">
                    <Warn />
                  </span>
                  Rate sheet dated {fmtDate(p.lastUpdated)} — oldest in this snapshot, confirm before quoting
                </span>
              )}
            </>
          )}
        </div>

        {/* Right: talk track + actions, one panel */}
        <div className="flex w-full shrink-0 flex-col xl:w-[400px] overflow-clip rounded-md border border-border">
          <div className="flex flex-col gap-2 bg-blue-soft p-4">
            <div className="flex items-center justify-between">
              <span className="label-caps text-blue">Say this</span>
              <button type="button" onClick={copy} className="text-xs font-semibold leading-4 text-blue">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-base leading-[22px]">{talk}</p>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <p className="flex items-start gap-2 text-sm leading-5">
              <span className="shrink-0 font-semibold">Next step</span>
              <span className="text-muted">{nextStep(m)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MailLink {...proposalMail(m, i)} log={{ kind: "proposal", customerName: i.contactName, customerEmail: i.customerEmail, programIds: [m.program.id] }} disabledReason={!eligible ? "Program is not eligible" : !i.customerEmail ? "Add the customer's email in the intake rail" : undefined}>
                Email proposal
              </MailLink>
              <button
                type="button"
                onClick={onCompare}
                disabled={m.tier === "ineligible" || (!inCompare && compareFull)}
                title={!inCompare && compareFull ? "Compare is full (4) — remove one first" : undefined}
                className={`flex h-[38px] items-center gap-2 rounded-full border px-4 text-[14px] font-medium leading-4 disabled:opacity-40 ${inCompare ? "border-blue bg-blue-soft text-blue" : "border-ink"}`}
              >
                {inCompare ? "✓ In compare · remove" : compareFull ? "Compare full (4)" : "Add to compare"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-lg border-t border-border bg-ground px-4 sm:px-6 py-[10px] text-xs leading-4">
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-1">
          <span className="flex h-[22px] items-center rounded-[4px] bg-navy px-2 text-[11px] font-bold leading-[14px] tracking-[0.08em] text-white">REP ONLY</span>
          <Kv k="SBA guarantee" v={`${p.guaranteePct}%`} />
          <Sep />
          <Kv k="Min credit" v={String(p.minCredit)} />
          <Sep />
          <Kv k="Min time" v={`${p.minYears} yr${p.minYears === 1 ? "" : "s"}`} />
          <Sep />
          <Kv k="Max debt ratio" v={p.maxDebtRatio == null ? "none listed" : String(p.maxDebtRatio)} />
          <Sep />
          <Kv k="Rate sheet" v={fmtDate(p.lastUpdated)} amber={oldestSheet} />
        </div>
        <button type="button" onClick={onToggle} className="flex items-center gap-[6px] font-medium text-muted sm:pl-4">
          Hide details <Chevron up />
        </button>
      </div>
    </article>
  );
}

const InComparePill = ({ onOpen, size = "sm" }: { onOpen: () => void; size?: "sm" | "md" }) => (
  <button type="button" onClick={onOpen} title="Open compare" className={`flex items-center gap-[6px] rounded-full bg-blue px-3 text-sm font-semibold leading-4 text-white ${size === "sm" ? "h-7" : "h-[30px]"}`}>
    <span className="text-[11px]">✓</span> In compare
  </button>
);

const Sep = () => <span className="text-border">|</span>;
const Kv = ({ k, v, amber }: { k: string; v: string; amber?: boolean }) => (
  <span className="flex items-center gap-[5px]">
    <span className="text-muted">{k}</span>
    <span className={`font-semibold ${amber ? "text-amber" : ""}`}>{v}</span>
  </span>
);
