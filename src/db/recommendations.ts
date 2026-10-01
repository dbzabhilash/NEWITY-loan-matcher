import { count, inArray } from "drizzle-orm";
import type { Db } from "./client";
import { lenderPrograms, recommendationPrograms, recommendations } from "./schema";

export interface RecommendationInput {
  kind: "proposal" | "comparison";
  customerName: string;
  customerEmail: string;
  programIds: number[];
}

/** One row per email draft an SDR opened. proposal = exactly 1 program, comparison = 2 or more. */
export function logRecommendation(db: Db, userId: number, r: RecommendationInput): { id: number } | { error: string } {
  const ids = [...new Set(r.programIds)];
  if (r.kind === "proposal" && ids.length !== 1) return { error: "a proposal has exactly 1 program" };
  if (r.kind === "comparison" && ids.length < 2) return { error: "a comparison has at least 2 programs" };
  const known = db.select({ n: count() }).from(lenderPrograms).where(inArray(lenderPrograms.id, ids)).get()!.n;
  if (known !== ids.length) return { error: "unknown program id" };
  return db.transaction((tx) => {
    const { id } = tx
      .insert(recommendations)
      .values({ userId, kind: r.kind, customerName: r.customerName, customerEmail: r.customerEmail, sentAt: new Date().toISOString() })
      .returning({ id: recommendations.id })
      .get();
    tx.insert(recommendationPrograms).values(ids.map((lenderProgramId) => ({ recommendationId: id, lenderProgramId }))).run();
    return { id };
  });
}
