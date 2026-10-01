import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { login, logout, userFromToken } from "./auth";
import * as schema from "./schema";
import { sessions } from "./schema";

const db = drizzle(new Database(":memory:"), { schema });
migrate(db, { migrationsFolder: "drizzle" });

describe("auth", () => {
  it("rejects a wrong password or unknown user", () => {
    expect(login(db, "sdr1", "nope")).toBeNull();
    expect(login(db, "ghost", "password")).toBeNull();
    expect(userFromToken(db, undefined)).toBeNull();
    expect(userFromToken(db, "not-a-token")).toBeNull();
  });

  it("logs in, resolves the session, logs out", () => {
    const r = login(db, "manager1", "password")!;
    expect(r.user).toEqual({ id: 9, name: "Sales Manager 1", role: "manager" });
    expect(userFromToken(db, r.token)).toEqual(r.user);
    logout(db, r.token);
    expect(userFromToken(db, r.token)).toBeNull();
  });

  it("ignores expired sessions", () => {
    const r = login(db, "sdr8", "password")!;
    db.update(sessions).set({ expiresAt: "2000-01-01T00:00:00.000Z" }).where(eq(sessions.id, r.token)).run();
    expect(userFromToken(db, r.token)).toBeNull();
  });
});
