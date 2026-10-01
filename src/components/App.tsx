"use client";
import type { User } from "@/db/auth";
import { useIntake } from "@/lib/intake";
import { rank } from "@/lib/rank";
import { evaluate } from "@/lib/rules";
import type { Match, Preset, Program, Snapshot } from "@/lib/types";
import { useMemo, useState } from "react";
import { CompareView } from "./compare/CompareView";
import { IntakeRail } from "./intake/IntakeRail";
import { MatchesHeader, MatchList, SortRow } from "./matches/MatchList";
import { TopBar } from "./TopBar";

export const COMPARE_LIMIT = 4;

export function App({ programs, snapshot, user }: { programs: Program[]; snapshot: Snapshot; user: User }) {
  const [intake, patch, reset] = useIntake();
  const [preset, setPreset] = useState<Preset>("best");
  const [view, setView] = useState<"ranked" | "compare">("ranked");
  const [pinned, setPinned] = useState<number[]>([]); // program ids the rep added, in order

  const ranked = useMemo(() => rank(programs.map((p) => evaluate(p, intake)), preset), [programs, intake, preset]);

  // Compare = only what the rep added. A program that turned ineligible after an intake change drops out.
  const cols = useMemo<Match[]>(() => {
    const byId = new Map(ranked.map((m) => [m.program.id, m]));
    return pinned.map((id) => byId.get(id)).filter((m): m is Match => !!m && m.tier !== "ineligible");
  }, [ranked, pinned]);
  const compareIds = useMemo(() => new Set(cols.map((c) => c.program.id)), [cols]);

  const add = (m: Match) => setPinned((p) => (p.includes(m.program.id) || p.length >= COMPARE_LIMIT ? p : [...p, m.program.id]));
  const remove = (id: number) => setPinned((p) => p.filter((x) => x !== id));
  const replaceAt = (n: number, m: Match) => {
    const ids = cols.map((c) => c.program.id);
    if (n < ids.length) ids[n] = m.program.id;
    else ids.push(m.program.id);
    setPinned(ids.slice(0, COMPARE_LIMIT));
  };
  const toggleCompare = (m: Match) => (compareIds.has(m.program.id) ? remove(m.program.id) : add(m));

  const eligibleCount = ranked.filter((m) => m.tier !== "ineligible").length;

  const sub =
    view === "compare"
      ? `Comparing ${cols.length} of ${eligibleCount} eligible programs · not an approval`
      : `Ranked${intake.businessName ? ` for ${intake.businessName}` : ""} · re-ranks as you type · not an approval`;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar snapshot={snapshot} user={user} />
      <main className="flex flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-start">
        <IntakeRail intake={intake} patch={patch} reset={reset} matches={ranked} />
        <section className="flex min-w-0 grow flex-col gap-4">
          <MatchesHeader matches={ranked} sub={sub} />
          <SortRow preset={preset} setPreset={setPreset} intake={intake} view={view} setView={setView} compareCount={cols.length} eligibleCount={ranked.filter((m) => m.tier === "strong").length} />
          {view === "ranked" ? (
            <MatchList ranked={ranked} intake={intake} compareIds={compareIds} compareFull={cols.length >= COMPARE_LIMIT} onToggleCompare={toggleCompare} onOpenCompare={() => setView("compare")} oldest={snapshot.oldestRateSheet} />
          ) : (
            <CompareView all={ranked} cols={cols} setCol={replaceAt} removeCol={remove} limit={COMPARE_LIMIT} intake={intake} oldest={snapshot.oldestRateSheet} onBrowse={() => setView("ranked")} />
          )}
        </section>
      </main>
    </div>
  );
}
