import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, expect, it } from "vitest";
import { CSV_PATH, ingestCsv } from "./ingest";
import { logRecommendation } from "./recommendations";
import * as schema from "./schema";
import { lenderPrograms, recommendationPrograms, recommendations } from "./schema";

const db = drizzle(new Database(":memory:"), { schema });
migrate(db, { migrationsFolder: "drizzle" });
ingestCsv(db, CSV_PATH);
const [a, b, c] = db.select({ id: lenderPrograms.id }).from(lenderPrograms).limit(3).all().map((r) => r.id);
const customer = { customerName: "Marisol Reyes", customerEmail: "marisol@example.com" };

describe("logRecommendation", () => {
  it("logs a proposal and a comparison (duplicate ids collapse)", () => {
    expect(logRecommendation(db, 1, { kind: "proposal", ...customer, programIds: [a] })).toEqual({ id: 1 });
    expect(logRecommendation(db, 2, { kind: "comparison", ...customer, programIds: [a, b, b, c] })).toEqual({ id: 2 });
    expect(db.select().from(recommendations).all().map((r) => [r.userId, r.kind])).toEqual([[1, "proposal"], [2, "comparison"]]);
    expect(db.select().from(recommendationPrograms).all().map((r) => [r.recommendationId, r.lenderProgramId])).toEqual([[1, a], [2, a], [2, b], [2, c]]);
  });

  it("rejects bad counts and unknown programs without writing", () => {
    expect(logRecommendation(db, 1, { kind: "proposal", ...customer, programIds: [a, b] })).toHaveProperty("error");
    expect(logRecommendation(db, 1, { kind: "comparison", ...customer, programIds: [a] })).toHaveProperty("error");
    expect(logRecommendation(db, 1, { kind: "proposal", ...customer, programIds: [999_999] })).toHaveProperty("error");
    expect(db.select().from(recommendations).all()).toHaveLength(2);
  });
});
