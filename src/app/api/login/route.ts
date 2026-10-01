import { NextResponse } from "next/server";
import { COOKIE, SESSION_DAYS, login } from "@/db/auth";
import { getDb } from "@/db/client";

export async function POST(req: Request) {
  const { username, password } = (await req.json().catch(() => null)) ?? {};
  const r = typeof username === "string" && typeof password === "string" ? login(getDb(), username, password) : null;
  if (!r) return NextResponse.json({ error: "invalid username or password" }, { status: 401 });
  const res = NextResponse.json(r.user);
  res.cookies.set(COOKIE, r.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}
