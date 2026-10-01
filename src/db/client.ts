import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import * as schema from "./schema";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.db");

function open() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("busy_timeout = 5000"); // first: next build's parallel workers open + migrate at once, and WAL switch needs the lock too
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db;
}

// Opened lazily on first request (never at import time, so `next build` page collection doesn't touch SQLite),
// and cached on globalThis to survive Next dev hot reloads.
const g = globalThis as unknown as { __newityDb?: ReturnType<typeof open> };
export function getDb() {
  return (g.__newityDb ??= open());
}
export type Db = ReturnType<typeof open>;
