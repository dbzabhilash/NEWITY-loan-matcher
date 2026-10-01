import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { latestSnapshot, loadPrograms } from "@/db/queries";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const db = getDb();
  const snap = latestSnapshot(db);
  if (!snap) return NextResponse.json({ error: "no snapshot imported" }, { status: 503 });
  const etag = `"${snap.fileHash.slice(0, 16)}"`;
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { ETag: etag } });
  const data = loadPrograms(db);
  return NextResponse.json(data, {
    headers: { ETag: etag, "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
