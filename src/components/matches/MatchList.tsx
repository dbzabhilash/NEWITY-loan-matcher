"use client";
import { fmtK, fmtMoney } from "@/lib/money";
import { buckets, PRESETS, tierCounts } from "@/lib/rank";
import { BLOCKER_FIELD, diagnose } from "@/lib/rules";
import type { Bucket, Intake, Match, Preset, Tier } from "@/lib/types";
import { useState } from "react";
import { MatchCard } from "./MatchCard";

const DOT: Record<Tier, string> = { strong: "bg-green", potential: "bg-amber", poor: "bg-poor", ineligible: "bg-red" };

export function MatchesHeader({ matches, sub }: { matches: Match[]; sub: string }) {
  const c = tierCounts(matches);
  return (
    <div className="flex flex-col gap-3 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-[6px]">
        <h1 className="text-2xl font-bold leading-10 sm:text-3xl sm:leading-12 tracking-[-0.03em]">Matches</h1>
        <p className="text-base leading-5 text-muted">{sub}</p>
      </div>
      <div className="flex max-w-full shrink-0 items-center self-start overflow-x-auto rounded-full border border-border bg-white text-sm leading-4">
        {(["strong", "potential", "poor", "ineligible"] as Tier[]).map((t, n) => (
          <span key={t} className={`flex items-center gap-2 whitespace-nowrap px-[14px] py-2 ${n < 3 ? "border-r border-border" : ""}`}>
            <span className={`size-2 rounded-full ${DOT[t]}`} />
            <span className="font-bold">{c[t]}</span>
            <span className="text-muted">{t}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function rankingLine(i: Intake) {
  const bits = [];
  if (i.requestedAmount) bits.push(fmtK(i.requestedAmount));
  if (i.targetDays) bits.push(`≤ ${i.targetDays} days`);
  if (i.desiredPayment) bits.push(`~${fmtMoney(i.desiredPayment)}/mo`);
  return bits.length ? `Ranking on ${bits.join(" · ")}` : "Enter an amount to start ranking";
}

export function SortRow({ preset, setPreset, intake, view, setView, compareCount, eligibleCount }: { preset: Preset; setPreset: (p: Preset) => void; intake: Intake; view: "ranked" | "compare"; setView: (v: "ranked" | "compare") => void; compareCount: number; eligibleCount: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="flex h-[34px] rounded-full border border-border bg-white p-[3px] text-sm leading-4">
          <button type="button" onClick={() => setView("ranked")} className={`flex h-[26px] items-center gap-[6px] whitespace-nowrap rounded-full px-[14px] ${view === "ranked" ? "bg-blue font-semibold text-white" : "font-medium text-muted"}`}>
            Ranked list
            <span className={`flex size-[18px] items-center justify-center rounded-full text-[11px] font-bold ${view === "ranked" ? "bg-white text-blue" : "bg-ground text-ink"}`}>{eligibleCount}</span>
          </button>
          <button type="button" onClick={() => setView("compare")} className={`flex h-[26px] items-center gap-[6px] whitespace-nowrap rounded-full px-[14px] ${view === "compare" ? "bg-blue font-semibold text-white" : "font-medium text-muted"}`}>
            Compare
            <span className={`flex size-[18px] items-center justify-center rounded-full text-[11px] font-bold ${view === "compare" ? "bg-white text-blue" : "bg-ground text-ink"}`}>{compareCount}</span>
          </button>
        </div>
        {view === "ranked" ? (
          <div className="flex flex-wrap items-center gap-[6px]">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`flex h-8 items-center whitespace-nowrap rounded-full px-[14px] text-sm leading-4 ${preset === p.id ? "bg-blue font-semibold text-white" : "border border-border bg-white font-medium hover:bg-ground"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm leading-4 text-muted">Top 3 by {PRESETS.find((p) => p.id === preset)?.label.toLowerCase()} · swap any column for another eligible program</span>
        )}
      </div>
      <span className="min-w-0 truncate text-sm leading-4 text-muted sm:text-right">{rankingLine(intake)}</span>
    </div>
  );
}

const BUCKET_COPY: Record<Bucket, (ms: Match[], i: Intake) => string> = {
  "wrong industry": (ms) => {
    const inds = [...new Set(ms.map((m) => m.program.industry?.toLowerCase().split("/")[0]).filter(Boolean))];
    return `${inds.join(", ").replace(/, ([^,]*)$/, " and $1")} only.`;
  },
  "too slow": (ms, i) => {
    const d = ms.map((m) => m.program.turnaroundDays);
    const cheap = ms.filter((m) => m.program.type === "504 Loan");
    const rates = cheap.length ? ` Includes the cheapest rates (504s at ${Math.min(...cheap.map((m) => m.program.rateMin))}–${Math.max(...cheap.map((m) => m.program.rateMax))}%).` : "";
    return `${Math.min(...d)}–${Math.max(...d)} days vs. ${i.targetDays}-day target.${rates}`;
  },
  "amount / credit": (ms, i) => {
    const mins = ms.filter((m) => i.requestedAmount != null && m.program.minAmount > i.requestedAmount);
    const credit = ms.filter((m) => i.creditScore != null && m.program.minCredit > i.creditScore);
    const bits = [];
    if (mins.length) bits.push(`${fmtK(Math.min(...mins.map((m) => m.program.minAmount)))} minimums`);
    if (credit.length) bits.push(`${credit.length === 1 ? "one lender wants" : `${credit.length} lenders want`} ${Math.min(...credit.map((m) => m.program.minCredit))}+ credit (customer est. ${i.creditScore})`);
    return bits.join("; ") + ".";
  },
  "property-only": (_, i) => `Real-estate-only or owner-occupied-only programs; ${i.purpose ? "loan purpose is " + i.purpose.toLowerCase() : "purpose isn't real estate"}.`,
  other: (ms) => {
    const reasons = [...new Set(ms.map((m) => m.rules.find((r) => r.status === "fail")?.reason).filter(Boolean))];
    return reasons.slice(0, 3).join("; ") + ".";
  },
};

export function OtherPrograms({ matches, intake, onShowAll, showingAll }: { matches: Match[]; intake: Intake; onShowAll: () => void; showingAll: boolean }) {
  const b = buckets(matches);
  const n = Object.values(b).flat().length;
  const order: Bucket[] = ["wrong industry", "too slow", "amount / credit", "property-only", "other"];
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg border border-border bg-white px-4 sm:px-6 py-[18px] lg:flex-row lg:gap-6">
      <div className="flex w-full shrink-0 flex-col gap-1 lg:w-[170px]">
        <span className="text-base font-bold leading-5">The other {n} programs</span>
        <span className="text-sm leading-[18px] text-muted">What would have to change for them to open up.</span>
        <button type="button" onClick={onShowAll} className="pt-[6px] text-left text-sm font-semibold leading-[18px] text-blue">
          {showingAll ? "Show top matches only" : `Show all ${matches.length} programs`}
        </button>
      </div>
      <div className="flex w-full grow flex-wrap gap-3">
        {order
          .filter((k) => b[k].length)
          .map((k) => (
            <div key={k} className="flex basis-[200px] grow flex-col gap-1 rounded-[8px] bg-ground px-3 py-[10px]">
              <span className="flex items-center gap-[6px] text-sm font-bold leading-4">
                <span className={`size-[6px] rounded-full ${k === "too slow" ? "bg-poor" : "bg-red"}`} />
                {b[k].length} {k}
              </span>
              <span className="text-xs leading-4 text-muted">{BUCKET_COPY[k](b[k], intake)}</span>
            </div>
          ))}
      </div>
    </section>
  );
}

function NoMatches({ ranked, intake }: { ranked: Match[]; intake: Intake }) {
  if (!intake.requestedAmount)
    return <div className="rounded-lg border border-dashed border-border bg-white px-4 sm:px-6 py-10 text-center text-base text-muted">Enter the requested amount to start ranking programs.</div>;
  const blockers = diagnose(ranked, intake);
  const poor = ranked.filter((m) => m.tier === "poor");
  const fastestPoor = poor.length ? Math.min(...poor.map((m) => m.program.turnaroundDays)) : null;
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-dashed border-border bg-white px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-1 text-center">
        <span className="text-base font-semibold">No program clears every hard rule yet.</span>
        <span className="text-sm text-muted">Check industry, credit and time in business.</span>
      </div>
      {blockers.length > 0 && (
        <div className="mx-auto flex w-full max-w-[640px] flex-col overflow-clip rounded-md border border-border">
          <div className="flex items-center justify-between gap-3 bg-ground px-4 py-2 text-xs font-semibold leading-4 tracking-[0.06em] text-muted uppercase">
            <span>Field · needs at least</span>
            <span>Unlocks on its own</span>
          </div>
          {blockers.map((b) => (
            <div key={b.id} className="flex items-start justify-between gap-4 border-t border-border px-4 py-3 text-sm leading-5">
              <span className="min-w-0">
                <span className="font-semibold">{BLOCKER_FIELD[b.id]}</span>
                <span className="text-muted"> · {b.requirement}</span>
              </span>
              <span className={`shrink-0 font-semibold ${b.unlocks ? "text-blue" : "text-faint"}`}>{b.unlocks ? `${b.unlocks} program${b.unlocks === 1 ? "" : "s"}` : `blocks ${b.failing}`}</span>
            </div>
          ))}
        </div>
      )}
      {fastestPoor != null && (
        <p className="text-center text-sm text-muted">
          {poor.length} program{poor.length === 1 ? "" : "s"} pass every hard rule but miss the {intake.targetDays}-day funding target — the fastest is {fastestPoor} days.
        </p>
      )}
    </div>
  );
}

export function MatchList({
  ranked,
  intake,
  compareIds,
  compareFull,
  onToggleCompare,
  onOpenCompare,
  oldest,
}: {
  ranked: Match[];
  intake: Intake;
  compareIds: Set<number>;
  compareFull: boolean;
  onToggleCompare: (m: Match) => void;
  onOpenCompare: () => void;
  oldest: string;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const best = ranked.filter((m) => m.tier === "strong");
  const visible = showAll ? ranked : ranked.filter((m) => m.tier === "strong" || m.tier === "potential");
  const openId = expanded ?? visible[0]?.program.id ?? null;

  return (
    <>
      {visible.length === 0 && <NoMatches ranked={ranked} intake={intake} />}
      {visible.map((m, n) => (
        <MatchCard
          key={m.program.id}
          m={m}
          i={intake}
          rank={n + 1}
          expanded={openId === m.program.id}
          onToggle={() => setExpanded(openId === m.program.id ? -1 : m.program.id)}
          onCompare={() => onToggleCompare(m)}
          onOpenCompare={onOpenCompare}
          inCompare={compareIds.has(m.program.id)}
          compareFull={compareFull}
          best={best}
          oldest={oldest}
        />
      ))}
      <OtherPrograms matches={ranked} intake={intake} onShowAll={() => setShowAll((s) => !s)} showingAll={showAll} />
    </>
  );
}
