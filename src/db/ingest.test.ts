import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { sql } from "drizzle-orm";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { diagnose, evaluate } from "../lib/rules";
import { buckets, rank, tierCounts } from "../lib/rank";
import type { Intake, Program } from "../lib/types";
import { CSV_PATH, ingestCsv } from "./ingest";
import { loadPrograms } from "./queries";
import * as schema from "./schema";

const db = drizzle(new Database(":memory:"), { schema });
let programs: Program[] = [];

/** Marisol's Taqueria — the intake shown in the design. */
export const MARISOL: Intake = {
  businessName: "Marisol's Taqueria",
  contactName: "Marisol Reyes",
  customerEmail: "",
  requestedAmount: 180_000,
  purpose: "Equipment + working capital",
  targetDays: 30,
  desiredPayment: 2500,
  ownerInjection: 20_000,
  industry: "Restaurant/Food Service",
  years: 3,
  months: 4,
  franchise: "No",
  ownerOccupied: "No",
  ownershipPct: null,
  creditScore: 690,
  cashFlow: 96_000,
  debtPayments: 2400,
  collateral: "Kitchen equipment ~$60k",
  bankruptcy: null,
};

beforeAll(() => {
  migrate(db, { migrationsFolder: "./drizzle" });
  const r = ingestCsv(db, CSV_PATH);
  expect(r.status).toBe("imported");
  expect(r.rows).toBe(49);
  programs = loadPrograms(db)!.programs;
});

describe("ingest", () => {
  it("is idempotent on same hash", () => expect(ingestCsv(db, CSV_PATH).status).toBe("exists"));
  it("a changed CSV becomes a new snapshot and is served", () => {
    const tmp = path.join(os.tmpdir(), "lenders-v2.csv");
    fs.writeFileSync(tmp, fs.readFileSync(CSV_PATH, "utf8").replace("Frontier Capital Group,SBA Express,25000,500000,650", "Frontier Capital Group,SBA Express,25000,500000,640"));
    const r = ingestCsv(db, tmp);
    expect(r.status).toBe("imported");
    expect(r.snapshotId).toBe(2);
    const v2 = loadPrograms(db)!;
    expect(v2.programs).toHaveLength(49);
    expect(v2.programs.find((p) => p.lender === "Frontier Capital Group" && p.type === "SBA Express")!.minCredit).toBe(640);
    programs = loadPrograms(db)!.programs; // later tests use the latest snapshot; 640 vs 650 doesn't change Marisol's results
  });
  it("normalizes lookups", () => {
    const c = (t: string) => (db.get(sql.raw(`select count(*) n from ${t}`)) as { n: number }).n;
    expect(c("lenders")).toBe(15);
    expect(c("program_types")).toBe(5);
    expect(c("business_types")).toBe(6);
    expect(c("special_requirements")).toBe(10);
    expect((db.get(sql.raw("select count(*) n from lender_programs where snapshot_id = (select max(id) from snapshots)")) as { n: number }).n).toBe(49);
  });
  it("blank debt ratio → NULL, All → NULL industry", () => {
    expect(programs.filter((p) => p.maxDebtRatio == null)).toHaveLength(9);
    expect(programs.filter((p) => p.industry == null)).toHaveLength(19);
    expect(programs.every((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.lastUpdated))).toBe(true);
  });
});

describe("rules on Marisol", () => {
  const find = (lender: string, type: string) => programs.find((p) => p.lender === lender && p.type === type)!;
  it("Frontier SBA Express strong 7/7 with no-refi watch", () => {
    const m = evaluate(find("Frontier Capital Group", "SBA Express"), MARISOL);
    expect(m.tier).toBe("strong");
    expect(`${m.passed} of ${m.total}`).toBe("7 of 7");
    expect(m.rules.find((r) => r.id === "special")?.status).toBe("watch");
  });
  it("First National 7(a) Small strong 6/6", () => {
    const m = evaluate(find("First National Bank", "7(a) Small Loan"), MARISOL);
    expect(m.tier).toBe("strong");
    expect(`${m.passed} of ${m.total}`).toBe("6 of 6");
  });
  it("BlueRidge SBA Express potential 5/6, gap ownership", () => {
    const m = evaluate(find("BlueRidge Lending Partners", "SBA Express"), MARISOL);
    expect(m.tier).toBe("potential");
    expect(`${m.passed} of ${m.total}`).toBe("5 of 6");
    expect(m.rules.find((r) => r.status === "unknown")?.gap).toBe("ownershipPct");
  });
  it("diagnoses the single disqualifying field", () => {
    const low = programs.map((p) => evaluate(p, { ...MARISOL, creditScore: 500 }));
    expect(low.some((m) => m.tier === "strong" || m.tier === "potential")).toBe(false);
    const b = diagnose(low, { ...MARISOL, creditScore: 500 });
    expect(b[0].id).toBe("credit");
    expect(b[0].unlocks).toBeGreaterThan(0);
    expect(b[0].requirement).toMatch(/at least 6\d0/);
    const other = programs.map((p) => evaluate(p, { ...MARISOL, industry: "Other" }));
    expect(diagnose(other, { ...MARISOL, industry: "Other" })[0].id).toBe("industry");
  });
  it("tier counts and buckets match design", () => {
    const all = programs.map((p) => evaluate(p, MARISOL));
    expect(tierCounts(all)).toEqual({ strong: 10, potential: 2, poor: 9, ineligible: 28 });
    const b = buckets(all);
    // Design mock shows 19/9/4/5; a consistent precedence (property > industry > amount/credit > slow) gives 20/9/3/5 = 37.
    expect(b["property-only"]).toHaveLength(5);
    expect(b["wrong industry"]).toHaveLength(20);
    expect(b["amount / credit"]).toHaveLength(3);
    expect(b["too slow"]).toHaveLength(9);
    expect(Object.values(b).flat()).toHaveLength(37);
    const ranked = rank(all, "best");
    expect(ranked.slice(0, 3).map((m) => `${m.program.lender} · ${m.program.type}`)).toEqual([
      "Frontier Capital Group · SBA Express",
      "First National Bank · 7(a) Small Loan",
      "Heritage Credit Union · SBA Express",
    ]);
    expect(ranked[10].program.lender).toBe("BlueRidge Lending Partners"); // first potential after the 10 strong
  });
});
