import { type NextRequest, NextResponse } from "next/server";
import { COOKIE, userFromToken } from "@/db/auth";
import { getDb } from "@/db/client";
import { traction } from "@/db/traction";

/** Managers only. ?from=<ISO instant>&to=<ISO instant, exclusive>&rep=<sdr user id> */
export function GET(req: NextRequest) {
  const db = getDb();
  const user = userFromToken(db, req.cookies.get(COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  if (user.role !== "manager") return NextResponse.json({ error: "managers only" }, { status: 403 });
  const q = req.nextUrl.searchParams;
  const ts = (k: string) => {
    const t = Date.parse(q.get(k) ?? "");
    return Number.isNaN(t) ? undefined : new Date(t).toISOString();
  };
  return NextResponse.json(traction(db, { from: ts("from"), to: ts("to"), rep: Number(q.get("rep")) || undefined }));
}
