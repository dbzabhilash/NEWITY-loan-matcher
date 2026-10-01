import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { CSV_PATH, ingestCsv } from "./ingest";
import { logRecommendation } from "./recommendations";
import * as schema from "./schema";
import { lenderPrograms, lenders, programTypes } from "./schema";
import { traction } from "./traction";

const db = drizzle(new Database(":memory:"), { schema });
migrate(db, { migrationsFolder: "drizzle" });
ingestCsv(db, CSV_PATH);
const P = db
  .select({ id: lenderPrograms.id, lender: lenders.name, type: programTypes.name })
  .from(lenderPrograms)
  .innerJoin(lenders, eq(lenderPrograms.lenderId, lenders.id))
  .innerJoin(programTypes, eq(lenderPrograms.programTypeId, programTypes.id))
  .limit(4)
  .all();
const [a, b, c, d] = P;
const customer = { customerName: "Marisol Reyes", customerEmail: "marisol@example.com" };
const name = (p: typeof a) => ({ lender: p.lender, type: p.type });

logRecommendation(db, 1, { kind: "proposal", ...customer, programIds: [a.id] });
logRecommendation(db, 1, { kind: "comparison", ...customer, programIds: [a.id, b.id, c.id] });
logRecommendation(db, 2, { kind: "comparison", ...customer, programIds: [a.id, b.id] });
logRecommendation(db, 3, { kind: "proposal", ...customer, programIds: [d.id] });

describe("traction", () => {
  const t = traction(db);

  it("totals", () => {
    expect(t.totals).toEqual({ sends: 4, comparisons: 2, solos: 2, programsWithSends: 4, programsTotal: 49 });
    expect(t.reps).toHaveLength(8);
    expect(t.firstSentAt?.slice(0, 10)).toBe(new Date().toISOString().slice(0, 10));
  });

  it("ranks programs and derives pairs + senders", () => {
    expect(t.programs.map((p) => [p.lender, p.type, p.total, p.compared, p.solo])).toEqual([
      [a.lender, a.type, 3, 2, 1],
      [b.lender, b.type, 2, 2, 0],
      [c.lender, c.type, 1, 1, 0],
      [d.lender, d.type, 1, 0, 1],
    ]);
    const top = t.programs[0];
    expect(top.pairs).toEqual([{ ...name(b), count: 2 }, { ...name(c), count: 1 }]);
    expect(top.reps).toEqual([{ id: 1, name: "Priya SDR 1", count: 2 }, { id: 2, name: "Diego SDR 2", count: 1 }]);
    expect(top.otherReps).toEqual({ reps: 0, sends: 0 });
    expect(top.lastSentBy).toBe("Diego SDR 2");
    expect(t.programs[3].pairs).toEqual([]);
  });

  it("filters by rep and by date", () => {
    const rep2 = traction(db, { rep: 2 });
    expect(rep2.totals.sends).toBe(1);
    expect(rep2.programs.map((p) => [p.lender, p.total])).toEqual([[a.lender, 1], [b.lender, 1]]);
    expect(traction(db, { to: "2000-01-01" }).totals).toMatchObject({ sends: 0, programsWithSends: 0 });
    expect(traction(db, { from: new Date(Date.now() - 60_000).toISOString() }).totals.sends).toBe(4);
    expect(traction(db, { from: new Date(Date.now() + 60_000).toISOString() }).totals.sends).toBe(0);
  });
});
