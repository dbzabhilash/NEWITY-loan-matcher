import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { Db } from "./client";
import { sessions, users } from "./schema";

export const COOKIE = "session";
export const SESSION_DAYS = 30;

export interface User {
  id: number;
  name: string;
  role: "sdr" | "manager";
}

/** Plain-text password compare by decision (demo accounts). Returns a fresh session token + user, or null. */
export function login(db: Db, username: string, password: string): { token: string; user: User } | null {
  const u = db.select().from(users).where(eq(users.username, username)).get();
  if (!u || u.password !== password) return null;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  db.insert(sessions).values({ id: token, userId: u.id, expiresAt }).run();
  return { token, user: { id: u.id, name: u.name, role: u.role } };
}

export function logout(db: Db, token: string) {
  db.delete(sessions).where(eq(sessions.id, token)).run();
}

/** User behind a session cookie; null if missing, unknown or expired. */
export function userFromToken(db: Db, token: string | undefined): User | null {
  if (!token) return null;
  return (
    db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date().toISOString())))
      .get() ?? null
  );
}
