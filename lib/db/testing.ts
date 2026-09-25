import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import type { Database as Db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

/** Fresh in-memory SQLite with all migrations applied. Node-only: tests and scripts. */
export function createTestDb(): { db: Db; raw: Database.Database } {
  const raw = new Database(":memory:");
  raw.pragma("foreign_keys = ON");
  const db = drizzle(raw, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
  return { db, raw };
}
