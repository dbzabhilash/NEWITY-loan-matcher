"use client";
import type { User } from "@/db/auth";
import type { Traction } from "@/db/traction";
import { initials } from "@/lib/copy";
import { fmtDate } from "@/lib/money";
import type { Snapshot } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "../LogoutButton";
import { TractionTable } from "./TractionTable";

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/** Local months from the first send (or this month) through next month, newest first. */
function monthsSince(firstSentAt: string | null) {
  const now = new Date();
  const first = firstSentAt && new Date(firstSentAt) < now ? new Date(firstSentAt) : now;
  const floor = new Date(first.getFullYear(), first.getMonth(), 1);
  const out: string[] = [];
  for (const d = new Date(now.getFullYear(), now.getMonth() + 1, 1); d >= floor; d.setMonth(d.getMonth() - 1)) out.push(ym(d));
  return out;
}

/** "2026-09" → "Sep 1–30, 2026" */
function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return `${new Date(y, mo - 1, 1).toLocaleDateString("en-US", { month: "short" })} 1–${new Date(y, mo, 0).getDate()}, ${y}`;
}
/** Month boundaries in the browser's timezone, as UTC instants (sent_at is stored as UTC ISO). */
function monthRange(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return { from: new Date(y, mo - 1, 1).toISOString(), to: new Date(y, mo, 1).toISOString() };
}

const chevron = (
  <svg width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
    <path d="M3 4.5l3 3 3-3" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Pill({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <span className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-[34px] appearance-none rounded-full border border-border bg-white pl-[14px] pr-8 text-sm font-medium leading-4">
        {children}
      </select>
      {chevron}
    </span>
  );
}

export function ManagerApp({ user, snapshot }: { user: User; snapshot: Snapshot }) {
  const [month, setMonth] = useState(() => ym(new Date())); // local "YYYY-MM" | "all"
  const [rep, setRep] = useState("all"); // "all" | user id
  const [data, setData] = useState<Traction | null>(null);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const q = new URLSearchParams(month === "all" ? {} : monthRange(month));
    if (rep !== "all") q.set("rep", rep);
    fetch(`/api/traction?${q}`).then(async (r) => (r.ok ? setData(await r.json()) : router.push("/login")));
  }, [month, rep, router]);

  const period = month === "all" ? "All time" : monthLabel(month);
  const months = monthsSince(data?.firstSentAt ?? null);
  const t = data?.totals;
  const programs = data?.programs ?? [];
  const shown = showAll ? programs : programs.slice(0, 8);
  const noSends = t ? t.programsTotal - t.programsWithSends : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-white px-4 py-2 sm:px-6">
        <div className="flex shrink-0 items-center gap-[14px]">
          <span className="text-[20px] font-[800] leading-6 tracking-[0.08em] text-blue">NEWITY</span>
          <span className="h-5 w-px bg-border" />
          <span className="text-base font-medium leading-5">Loan Matcher</span>
        </div>
        <div className="flex items-center gap-[10px] rounded-full border border-border bg-ground py-[6px] max-lg:order-last max-lg:w-full pl-[10px] pr-[14px] text-sm leading-4">
          <span className="size-2 shrink-0 rounded-full bg-blue" />
          <span className="font-semibold">Manager view · Team traction</span>
          <span className="text-muted">{period}</span>
        </div>
        <div className="flex items-center gap-4 text-sm leading-4 text-muted">
          <span className="hidden lg:inline">
            Lender snapshot {fmtDate(snapshot.date)} · {snapshot.programCount} programs · {snapshot.lenderCount} lenders
          </span>
          <span title={user.name} className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-semibold tracking-[0.04em] text-white">
            {initials(user.name)}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="flex flex-col items-center px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="flex w-full max-w-[1080px] flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-[6px]">
              <h1 className="text-2xl font-bold leading-10 sm:text-3xl sm:leading-12 tracking-[-0.03em]">Traction</h1>
              <p className="text-base leading-5 text-muted">Programs your reps put in front of customers · click a row to see what it was compared with and who sent it</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill value={month} onChange={setMonth}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
                <option value="all">All time</option>
              </Pill>
              <Pill value={rep} onChange={setRep}>
                <option value="all">All {data?.reps.length ?? ""} reps</option>
                {data?.reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Pill>
            </div>
          </div>

          <div className="flex w-max max-w-full items-center overflow-x-auto rounded-full border border-border bg-white text-sm leading-4 [&>span]:flex [&>span]:items-center [&>span]:whitespace-nowrap [&>span]:gap-2 [&>span]:px-[14px] [&>span]:py-2 [&>span+span]:border-l [&>span+span]:border-border">
            <span>
              <b className="font-bold">{t?.sends ?? "–"}</b> <span className="text-muted">sends</span>
            </span>
            <span>
              <i className="size-2 shrink-0 rounded-full bg-blue" />
              <b className="font-bold">{t?.comparisons ?? "–"}</b> <span className="text-muted">comparisons</span>
            </span>
            <span>
              <i className="size-2 shrink-0 rounded-full bg-green" />
              <b className="font-bold">{t?.solos ?? "–"}</b> <span className="text-muted">sent solo</span>
            </span>
            <span>
              <b className="font-bold">{t?.programsWithSends ?? "–"}</b> <span className="text-muted">of {t?.programsTotal ?? snapshot.programCount} programs got a send</span>
            </span>
          </div>

          <div className="flex flex-col overflow-clip rounded-lg border border-border bg-white">
            <div className="overflow-x-auto"><div className="min-w-[760px]">
            <div className="flex items-center gap-4 border-b border-border px-4 sm:px-6 py-3 text-xs font-semibold uppercase leading-4 tracking-wide text-muted">
              <span className="w-6 shrink-0">#</span>
              <span className="w-[300px] shrink-0">Program</span>
              <span className="grow">Recommendations · in a comparison vs. sent solo</span>
              <span className="w-[48px] shrink-0 text-right">Total</span>
              <span className="w-[160px] shrink-0 text-right">Split</span>
              <span className="size-4 shrink-0" />
            </div>
            {data ? (
              shown.length ? (
                <TractionTable programs={shown} max={programs[0].total} />
              ) : (
                <p className="px-4 sm:px-6 py-5 text-sm leading-4 text-muted">No sends {month === "all" ? "logged yet" : "in this period"}.</p>
              )
            ) : (
              <p className="px-4 sm:px-6 py-5 text-sm leading-4 text-muted">Loading…</p>
            )}
            </div></div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-[14px] text-sm">
              {programs.length > 8 ? (
                <button type="button" onClick={() => setShowAll((s) => !s)} className="font-semibold leading-[18px] text-blue">
                  {showAll ? "Show top 8" : `Show all ${programs.length} programs with sends`}
                </button>
              ) : (
                <span />
              )}
              {t && (
                <span className="leading-4 text-muted">
                  {noSends} programs had no sends {month === "all" ? "yet" : "this month"}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
