import { type NextRequest, NextResponse } from "next/server";
import { COOKIE, logout } from "@/db/auth";
import { getDb } from "@/db/client";

export function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (token) logout(getDb(), token);
  const res = new NextResponse(null, { status: 204 });
  res.cookies.delete(COOKIE);
  return res;
}
