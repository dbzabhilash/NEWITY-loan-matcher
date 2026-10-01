import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { SpecialKey } from "../lib/types";
import type { Db } from "./client";
import { businessTypes, lenderPrograms, lenders, programTypes, snapshots, specialRequirements } from "./schema";

export const CSV_PATH = process.env.CSV_PATH ?? path.join(process.cwd(), "data", "lenders.csv");

/** Rep-facing one-liners per program type (design copy). */
export const PROGRAM_BLURBS: Record<string, string> = {
  "SBA Express": "Fast-track 7(a) · lighter paperwork · lender decides, SBA backs half",
  "7(a) Standard": "Flagship SBA loan · widest uses · SBA backs 75–85%",
  "7(a) Small Loan": "Standard 7(a) under $350k · SBA backs 85%",
  "504 Loan": "Fixed assets + real estate · long terms · lowest rates",
  "Community Advantage": "Mission lenders · underserved markets · flexible credit",
};

export const SPECIAL_KEYS: Record<string, SpecialKey> = {
  "Must be in business at least 6 months before applying": "six_months",
  "Requires 10% owner injection": "injection_10",
  "Must demonstrate positive cash flow": "positive_cash_flow",
  "Franchise must be SBA-approved": "franchise_sba",
  "Owner-occupied real estate only": "owner_occupied_only",
  "Owner must have 20%+ equity stake": "equity_20",
  "No recent bankruptcies (7 years)": "no_bankruptcy",
  "Requires business plan for startups": "business_plan_startup",
  "Real estate purchase only": "real_estate_only",
  "Cannot be used for refinancing": "no_refi",
};

type Row = Record<string, string>;

const num = (s: string) => Number(s.trim());
const opt = (s: string) => (s.trim() === "" ? null : Number(s));
const toIso = (mdy: string) => {
  const [m, d, y] = mdy.trim().split("/").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

export function ingestCsv(db: Db, file = CSV_PATH): { status: "imported" | "exists"; snapshotId: number; rows: number } {
  const buf = readFileSync(file);
  const hash = createHash("sha256").update(buf).digest("hex");
  const existing = db.select().from(snapshots).where(eq(snapshots.fileHash, hash)).get();
  if (existing) return { status: "exists", snapshotId: existing.id, rows: existing.rowCount };

  const rows = parse(buf.toString("utf8").replace(/^﻿/, ""), { columns: true, skip_empty_lines: true, trim: true }) as Row[];

  return db.transaction((tx) => {
    const lenderId = (name: string) => {
      tx.insert(lenders).values({ name }).onConflictDoNothing().run();
      return tx.select().from(lenders).where(eq(lenders.name, name)).get()!.id;
    };
    const businessTypeId = (name: string) => {
      tx.insert(businessTypes).values({ name }).onConflictDoNothing().run();
      return tx.select().from(businessTypes).where(eq(businessTypes.name, name)).get()!.id;
    };
    const programTypeId = (name: string) => {
      tx.insert(programTypes).values({ name, blurb: PROGRAM_BLURBS[name] ?? "" }).onConflictDoNothing().run();
      return tx.select().from(programTypes).where(eq(programTypes.name, name)).get()!.id;
    };
    const specialId = (text: string) => {
      if (!text) return null;
      const ruleKey = SPECIAL_KEYS[text];
      if (!ruleKey) throw new Error(`Unknown special requirement in CSV: "${text}" — add it to SPECIAL_KEYS`);
      tx.insert(specialRequirements).values({ text, ruleKey }).onConflictDoNothing().run();
      return tx.select().from(specialRequirements).where(eq(specialRequirements.text, text)).get()!.id;
    };

    const snap = tx
      .insert(snapshots)
      .values({ sourceFile: path.basename(file), fileHash: hash, importedAt: new Date().toISOString(), rowCount: rows.length })
      .returning()
      .get();

    for (const r of rows) {
      tx.insert(lenderPrograms)
        .values({
          snapshotId: snap.id,
          lenderId: lenderId(r.lender_name),
          programTypeId: programTypeId(r.program_type),
          minAmount: num(r.min_loan_amount),
          maxAmount: num(r.max_loan_amount),
          minCredit: num(r.min_credit_score),
          creditTier: r.credit_tier_required,
          minYears: num(r.min_years_in_business),
          rateMin: num(r.interest_rate_min),
          rateMax: num(r.interest_rate_max),
          maxTermMonths: num(r.max_term_months),
          sbaPct: num(r.sba_guarantee_pct),
          businessTypeId: r.eligible_business_types === "All" ? null : businessTypeId(r.eligible_business_types),
          collateral: r.requires_collateral as "Yes" | "No" | "Varies",
          maxDebtRatio: opt(r.max_existing_debt_ratio),
          turnaroundDays: num(r.turnaround_days),
          specialRequirementId: specialId(r.special_requirements),
          lastUpdated: toIso(r.last_updated),
        })
        .run();
    }
    return { status: "imported" as const, snapshotId: snap.id, rows: rows.length };
  });
}
