import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "@/lib/db/schema";

/** Any Drizzle SQLite database with our schema: D1 in the Worker, better-sqlite3 in tests. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = BaseSQLiteDatabase<"sync" | "async", any, typeof schema>;

/** Request-scoped D1 database. Only callable on the server (route handlers, server components, actions). */
export async function getDb(): Promise<Database> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new Error("D1 binding DB is not configured (see wrangler.jsonc)");
  return drizzle(env.DB, { schema });
}
