"use client";
import type { ProgramTraction } from "@/db/traction";
import { initials } from "@/lib/copy";
import { useState } from "react";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const fmtShort = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function Chevron({ up }: { up: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
      <path d={up ? "M3 7.5l3-3 3 3" : "M3 4.5l3 3 3-3"} fill="none" stroke={up ? "var(--color-blue)" : "var(--color-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const label = "text-xs font-semibold uppercase leading-4 tracking-wide text-muted";

function Details({ p }: { p: ProgramTraction }) {
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-5 border-b border-border bg-ground pb-5 pl-[64px] pr-6 pt-[2px] text-sm leading-[18px]">
      <div className="flex w-[440px] max-w-full shrink-0 flex-col gap-[10px]">
        <span className={label}>Most compared with</span>
        {p.pairs.length ? (
          p.pairs.map((q) => (
            <div key={`${q.lender}|${q.type}`} className="flex items-center justify-between">
              <span className="font-semibold">
                {q.lender} · {q.type}
              </span>
              <span className="shrink-0 pl-3 text-muted">in {plural(q.count, "comparison")}</span>
            </div>
          ))
        ) : (
          <span className="text-muted">Only sent on its own so far</span>
        )}
      </div>
      <div className="flex w-[280px] shrink-0 flex-col gap-[10px]">
        <span className={label}>Most recommended by</span>
        {p.reps.map((r) => (
          <div key={r.id} className="flex items-center gap-[10px]">
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-navy text-[9px] font-bold leading-3 text-white">{initials(r.name)}</span>
            <span className="grow font-semibold">{r.name}</span>
            <span className="text-muted">{plural(r.count, "send")}</span>
          </div>
        ))}
      </div>
      <div className="flex grow flex-col items-end gap-[10px] pt-[26px] text-right text-muted">
        {p.otherReps.reps > 0 && (
          <span>
            {plural(p.otherReps.reps, "other rep")} sent it {plural(p.otherReps.sends, "time")}
          </span>
        )}
        <span>
          Last sent {fmtShort(p.lastSentAt)} · {p.lastSentBy}
        </span>
      </div>
    </div>
  );
}

export function TractionTable({ programs, max }: { programs: ProgramTraction[]; max: number }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {programs.map((p, i) => {
        const isOpen = open === p.key;
        const both = p.compared > 0 && p.solo > 0;
        const w = (n: number) => `calc(${(100 * n) / max}% - ${both ? 1 : 0}px)`;
        return (
          <div key={p.key}>
            <button type="button" onClick={() => setOpen(isOpen ? null : p.key)} className={`flex w-full items-center gap-4 px-4 sm:px-6 py-[14px] text-left ${isOpen ? "bg-ground" : "border-b border-border"}`}>
              <span className="w-6 shrink-0 text-sm font-medium leading-4 text-muted">{i + 1}</span>
              <span className="flex w-[300px] shrink-0 flex-col gap-[2px]">
                <span className="text-base font-semibold leading-5">{p.lender}</span>
                <span className="text-sm font-medium leading-4 text-blue">{p.type}</span>
              </span>
              <span className={`flex h-3 grow gap-[2px] overflow-clip rounded-full ${isOpen ? "bg-white" : "bg-ground"}`}>
                {p.compared > 0 && <span className="h-3 shrink-0 bg-blue" style={{ width: w(p.compared) }} />}
                {p.solo > 0 && <span className="h-3 shrink-0 bg-green" style={{ width: w(p.solo) }} />}
              </span>
              <span className="w-[48px] shrink-0 text-right text-base font-bold leading-5">{p.total}</span>
              <span className="w-[160px] shrink-0 text-right text-sm leading-4 text-muted">
                {p.compared} compared · {p.solo} solo
              </span>
              <span className="flex size-4 shrink-0 items-center justify-center">
                <Chevron up={isOpen} />
              </span>
            </button>
            {isOpen && <Details p={p} />}
          </div>
        );
      })}
    </>
  );
}
