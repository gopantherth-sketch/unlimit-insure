import { isValidEvent } from "@/lib/analytics/events";
import { getDb } from "@/lib/db/client";
import { recordEvent } from "@/lib/db/analytics";

// Anonymous counters. Nothing about the caller is stored; the throttle key is a hash held in memory.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 200;
const hits = new Map<string, number[]>();

async function key(req: Request): Promise<string> {
  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`ev:${ip}`));
  return Array.from(new Uint8Array(d).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  const k = await key(req);
  const now = Date.now();
  const recent = (hits.get(k) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(k, recent);
  if (hits.size > 5000) hits.clear();
  if (recent.length > MAX_PER_WINDOW) return new Response(null, { status: 429 });

  let body: { name?: unknown; dim?: unknown };
  try {
    const text = await req.text();
    if (text.length > 200) return new Response(null, { status: 413 });
    body = JSON.parse(text) as typeof body;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!isValidEvent(body.name, body.dim)) return new Response(null, { status: 400 });
  await recordEvent(await getDb(), body.name, typeof body.dim === "string" ? body.dim : "");
  return new Response(null, { status: 204 });
}
