import type { Bucket, Match, Preset, Tier } from "./types";

const TIER_ORDER: Record<Tier, number> = { strong: 0, potential: 1, poor: 2, ineligible: 3 };

export const PRESETS: { id: Preset; label: string }[] = [
  { id: "best", label: "Best fit" },
  { id: "rate", label: "Lowest rate" },
  { id: "speed", label: "Fastest funding" },
  { id: "payment", label: "Lowest payment" },
  { id: "collateral", label: "No collateral" },
];

function key(m: Match, preset: Preset): number {
  switch (preset) {
    case "rate": return m.program.rateMid;
    case "speed": return m.program.turnaroundDays;
    case "payment": return m.payment ?? Infinity;
    case "collateral": return (m.program.collateral === "No" ? 0 : m.program.collateral === "Varies" ? 50 : 100) + m.score;
    default: return m.score;
  }
}

export function rank(matches: Match[], preset: Preset): Match[] {
  return [...matches].sort(
    (a, b) =>
      TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
      key(a, preset) - key(b, preset) ||
      a.program.lender.localeCompare(b.program.lender),
  );
}

export function tierCounts(matches: Match[]): Record<Tier, number> {
  const c: Record<Tier, number> = { strong: 0, potential: 0, poor: 0, ineligible: 0 };
  for (const m of matches) c[m.tier]++;
  return c;
}

export function buckets(matches: Match[]): Record<Bucket, Match[]> {
  const b: Record<Bucket, Match[]> = { "wrong industry": [], "property-only": [], "amount / credit": [], "too slow": [], other: [] };
  for (const m of matches) if (m.bucket) b[m.bucket].push(m);
  return b;
}
