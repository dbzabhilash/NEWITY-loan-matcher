import { desc, eq } from "drizzle-orm";
import type { Program, Snapshot, SpecialKey } from "../lib/types";
import type { Db } from "./client";
import { businessTypes, lenderPrograms, lenders, programTypes, snapshots, specialRequirements } from "./schema";

export function latestSnapshot(db: Db) {
  return db.select().from(snapshots).orderBy(desc(snapshots.id)).limit(1).get() ?? null;
}

export function loadPrograms(db: Db): { snapshot: Snapshot; programs: Program[] } | null {
  const snap = latestSnapshot(db);
  if (!snap) return null;

  const rows = db
    .select({
      lp: lenderPrograms,
      lender: lenders.name,
      type: programTypes.name,
      blurb: programTypes.blurb,
      industry: businessTypes.name,
      specialText: specialRequirements.text,
      specialKey: specialRequirements.ruleKey,
    })
    .from(lenderPrograms)
    .innerJoin(lenders, eq(lenderPrograms.lenderId, lenders.id))
    .innerJoin(programTypes, eq(lenderPrograms.programTypeId, programTypes.id))
    .leftJoin(businessTypes, eq(lenderPrograms.businessTypeId, businessTypes.id))
    .leftJoin(specialRequirements, eq(lenderPrograms.specialRequirementId, specialRequirements.id))
    .where(eq(lenderPrograms.snapshotId, snap.id))
    .all();

  const programs: Program[] = rows.map(({ lp, lender, type, blurb, industry, specialText, specialKey }) => ({
    id: lp.id,
    lender,
    type,
    typeBlurb: blurb,
    minAmount: lp.minAmount,
    maxAmount: lp.maxAmount,
    minCredit: lp.minCredit,
    creditTier: lp.creditTier,
    minYears: lp.minYears,
    rateMin: lp.rateMin,
    rateMax: lp.rateMax,
    rateMid: (lp.rateMin + lp.rateMax) / 2,
    maxTerm: lp.maxTermMonths,
    guaranteePct: lp.sbaPct,
    industry,
    collateral: lp.collateral,
    maxDebtRatio: lp.maxDebtRatio,
    turnaroundDays: lp.turnaroundDays,
    special: specialText && specialKey ? { text: specialText, key: specialKey as SpecialKey } : null,
    lastUpdated: lp.lastUpdated,
  }));

  const dates = programs.map((p) => p.lastUpdated).sort();
  return {
    snapshot: {
      date: dates[dates.length - 1] ?? snap.importedAt.slice(0, 10),
      importedAt: snap.importedAt,
      programCount: programs.length,
      lenderCount: new Set(programs.map((p) => p.lender)).size,
      oldestRateSheet: dates[0] ?? "",
    },
    programs,
  };
}
