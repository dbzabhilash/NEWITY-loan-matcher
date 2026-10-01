import { and, count, eq, gte, lt, min, sql } from "drizzle-orm";
import type { Db } from "./client";
import { latestSnapshot } from "./queries";
import { lenderPrograms, lenders, programTypes, recommendationPrograms, recommendations, users } from "./schema";

/** ISO instants (UTC): `from` inclusive, `to` exclusive. `rep` = SDR user id. */
export interface TractionFilter {
  from?: string;
  to?: string;
  rep?: number;
}

export interface ProgramTraction {
  key: string; // `${lenderId}:${programTypeId}` — stable across snapshots
  lender: string;
  type: string;
  total: number;
  compared: number; // comparisons it appeared in
  solo: number; // proposals
  lastSentAt: string;
  lastSentBy: string;
  pairs: { lender: string; type: string; count: number }[]; // top 3 programs it was compared with
  reps: { id: number; name: string; count: number }[]; // top 3 senders
  otherReps: { reps: number; sends: number };
}

export interface Traction {
  totals: { sends: number; comparisons: number; solos: number; programsWithSends: number; programsTotal: number };
  programs: ProgramTraction[]; // most sent first
  reps: { id: number; name: string }[]; // every SDR, for the filter
  firstSentAt: string | null; // earliest send ever (unfiltered); the client builds its month list from it
}

const TOP = 3;

export function traction(db: Db, f: TractionFilter = {}): Traction {
  const rows = db
    .select({
      rec: recommendations.id,
      kind: recommendations.kind,
      sentAt: recommendations.sentAt,
      userId: users.id,
      userName: users.name,
      key: sql<string>`${lenderPrograms.lenderId} || ':' || ${lenderPrograms.programTypeId}`,
      lender: lenders.name,
      type: programTypes.name,
    })
    .from(recommendationPrograms)
    .innerJoin(recommendations, eq(recommendationPrograms.recommendationId, recommendations.id))
    .innerJoin(users, eq(recommendations.userId, users.id))
    .innerJoin(lenderPrograms, eq(recommendationPrograms.lenderProgramId, lenderPrograms.id))
    .innerJoin(lenders, eq(lenderPrograms.lenderId, lenders.id))
    .innerJoin(programTypes, eq(lenderPrograms.programTypeId, programTypes.id))
    .where(
      and(
        f.from ? gte(recommendations.sentAt, f.from) : undefined,
        f.to ? lt(recommendations.sentAt, f.to) : undefined,
        f.rep ? eq(recommendations.userId, f.rep) : undefined,
      ),
    )
    .orderBy(recommendations.id)
    .all();
  type Row = (typeof rows)[number];

  const byRec = new Map<number, Row[]>();
  for (const r of rows) (byRec.get(r.rec) ?? byRec.set(r.rec, []).get(r.rec)!).push(r);

  type Acc = { lender: string; type: string; compared: number; solo: number; lastSentAt: string; lastSentBy: string; pairs: Map<string, number>; reps: Map<number, { name: string; count: number }> };
  const progs = new Map<string, Acc>();
  const acc = (r: Row) =>
    progs.get(r.key) ?? progs.set(r.key, { lender: r.lender, type: r.type, compared: 0, solo: 0, lastSentAt: "", lastSentBy: "", pairs: new Map(), reps: new Map() }).get(r.key)!;

  let comparisons = 0;
  for (const group of byRec.values()) {
    const comparison = group[0].kind === "comparison";
    if (comparison) comparisons++;
    for (const r of group) {
      const p = acc(r);
      if (comparison) p.compared++;
      else p.solo++;
      const rep = p.reps.get(r.userId) ?? { name: r.userName, count: 0 };
      rep.count++;
      p.reps.set(r.userId, rep);
      if (r.sentAt >= p.lastSentAt) Object.assign(p, { lastSentAt: r.sentAt, lastSentBy: r.userName });
      if (comparison) for (const o of group) if (o.key !== r.key) p.pairs.set(o.key, (p.pairs.get(o.key) ?? 0) + 1);
    }
  }

  const programs = [...progs.entries()]
    .map(([key, p]) => {
      const reps = [...p.reps.entries()].map(([id, r]) => ({ id, ...r })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      const others = reps.slice(TOP);
      return {
        key,
        lender: p.lender,
        type: p.type,
        total: p.compared + p.solo,
        compared: p.compared,
        solo: p.solo,
        lastSentAt: p.lastSentAt,
        lastSentBy: p.lastSentBy,
        pairs: [...p.pairs.entries()]
          .sort((a, b) => b[1] - a[1] || progs.get(a[0])!.lender.localeCompare(progs.get(b[0])!.lender))
          .slice(0, TOP)
          .map(([k, n]) => ({ lender: progs.get(k)!.lender, type: progs.get(k)!.type, count: n })),
        reps: reps.slice(0, TOP),
        otherReps: { reps: others.length, sends: others.reduce((s, r) => s + r.count, 0) },
      };
    })
    .sort((a, b) => b.total - a.total || b.compared - a.compared || a.lender.localeCompare(b.lender));

  const snap = latestSnapshot(db);
  const programsTotal = snap ? db.select({ n: count() }).from(lenderPrograms).where(eq(lenderPrograms.snapshotId, snap.id)).get()!.n : 0;
  const reps = db.select({ id: users.id, name: users.name }).from(users).where(eq(users.role, "sdr")).orderBy(users.name).all();
  const firstSentAt = db.select({ m: min(recommendations.sentAt) }).from(recommendations).get()?.m ?? null;

  return {
    totals: { sends: byRec.size, comparisons, solos: byRec.size - comparisons, programsWithSends: progs.size, programsTotal },
    programs,
    reps,
    firstSentAt,
  };
}
