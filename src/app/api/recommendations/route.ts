import { type NextRequest, NextResponse } from "next/server";
import { COOKIE, userFromToken } from "@/db/auth";
import { getDb } from "@/db/client";
import { logRecommendation } from "@/db/recommendations";

export async function POST(req: NextRequest) {
  const db = getDb();
  const user = userFromToken(db, req.cookies.get(COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  const b = (await req.json().catch(() => null)) ?? {};
  const ok =
    (b.kind === "proposal" || b.kind === "comparison") &&
    typeof b.customerName === "string" &&
    typeof b.customerEmail === "string" &&
    b.customerEmail.trim() !== "" &&
    Array.isArray(b.programIds) &&
    b.programIds.every((n: unknown) => Number.isInteger(n));
  if (!ok) return NextResponse.json({ error: "expected { kind: 'proposal' | 'comparison', customerName, customerEmail, programIds: number[] }" }, { status: 400 });
  const r = logRecommendation(db, user.id, b);
  return NextResponse.json(r, { status: "error" in r ? 400 : 201 });
}
