"use client";
import { RULE_LABEL } from "@/lib/rules";
import type { Match, RuleResult, RuleStatus, Tier } from "@/lib/types";
import type { ReactNode } from "react";

export function rulesLabel(m: Match) {
  const unknown = m.rules.some((r) => r.status === "unknown");
  return `${m.passed} of ${m.total} rules ${unknown ? "known" : "pass"}`;
}

const MARK: Record<RuleStatus, { glyph: string; cls: string }> = {
  pass: { glyph: "✓", cls: "text-ink" },
  watch: { glyph: "!", cls: "text-amber" },
  unknown: { glyph: "?", cls: "text-amber" },
  fail: { glyph: "×", cls: "text-red" },
  "n/a": { glyph: "–", cls: "text-faint" },
};
const WORD: Record<RuleStatus, string> = { pass: "pass", watch: "confirm", unknown: "unanswered", fail: "fail", "n/a": "" };

export const TIER_LABEL: Record<Tier, string> = { strong: "Strong fit", potential: "Potential fit", poor: "Poor fit", ineligible: "Ineligible" };
export const TIER_PILL: Record<Tier, string> = {
  strong: "bg-green text-ink",
  potential: "bg-amber-soft text-ink border border-amber",
  poor: "bg-ground text-muted border border-border",
  ineligible: "bg-red-soft text-red",
};

/** Hover/focus tooltip shell shared by the rules pill and the tier pill. */
function Tip({ trigger, title, rules, align = "right" }: { trigger: ReactNode; title: string; rules: RuleResult[]; align?: "left" | "right" }) {
  return (
    <span className="group relative inline-flex">
      {trigger}
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-[calc(100%+6px)] z-30 hidden w-[300px] flex-col gap-[6px] rounded-md border border-border bg-white p-3 text-left shadow-[0_12px_32px_#0C152124] group-focus-within:flex group-hover:flex ${align === "right" ? "right-0" : "left-0"}`}
      >
        <span className="label-caps text-muted">{title}</span>
        {rules.map((r) => (
          <span key={r.id + r.reason} className="flex items-start gap-2 text-sm leading-[18px]">
            <span className={`w-3 shrink-0 text-center font-bold ${MARK[r.status].cls}`}>{MARK[r.status].glyph}</span>
            <span className="min-w-0 grow">
              <span className="font-medium">{RULE_LABEL[r.id]}</span>
              <span className="text-muted"> · {WORD[r.status]}</span>
              <span className="block text-xs leading-4 text-muted">{r.reason}</span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

/** "N of M rules pass" pill; tooltip lists every rule and its status. */
export function RulesPill({ m, size = "md" }: { m: Match; size?: "sm" | "md" }) {
  return (
    <Tip
      title="Rules for this program"
      rules={m.rules.filter((r) => r.status !== "n/a")}
      trigger={
        <span tabIndex={0} className={`flex cursor-help items-center rounded-full border border-border bg-white px-3 text-sm font-medium leading-4 ${size === "sm" ? "h-7" : "h-[30px]"}`}>
          {rulesLabel(m)}
        </span>
      }
    />
  );
}

/** Tier pill; for poor / ineligible programs the tooltip lists exactly which rules fail (and any still unanswered). */
export function TierPill({ m, size = "md", align }: { m: Match; size?: "xs" | "sm" | "md"; align?: "left" | "right" }) {
  const h = size === "xs" ? "h-5 px-2 text-[11px] leading-3" : size === "sm" ? "h-7 px-3 text-sm leading-4" : "h-[30px] px-3 text-sm leading-4";
  const pill = <span tabIndex={0} className={`flex items-center whitespace-nowrap rounded-full font-bold ${h} ${TIER_PILL[m.tier]} ${m.tier === "poor" || m.tier === "ineligible" ? "cursor-help" : ""}`}>{TIER_LABEL[m.tier]}</span>;
  if (m.tier === "strong" || m.tier === "potential") return pill;
  const blocking = m.rules.filter((r) => r.status === "fail" || r.status === "unknown");
  return <Tip title={m.tier === "ineligible" ? "Why it's ineligible" : "Why it's a poor fit"} rules={blocking} trigger={pill} align={align} />;
}

/** Plain-text version of the failing rules, for native `title` attributes. */
export function failText(m: Match) {
  return m.rules
    .filter((r) => r.status === "fail")
    .map((r) => `× ${RULE_LABEL[r.id]}: ${r.reason}`)
    .join("\n");
}
