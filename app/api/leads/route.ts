import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { createLead } from "@/lib/db/leads";
import { normalizePhone, validateLead, type LeadRequest } from "@/lib/leads";
import { parsePriorities, parseUsage, parseVehicle } from "@/lib/params";
import { getCatalog } from "@/lib/server/catalog";

// Best-effort per-isolate throttle. Keys are hashed and held in memory only; nothing about the caller is stored.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

async function throttleKey(req: Request): Promise<string> {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  if (limited(await throttleKey(req))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Partial<LeadRequest>;
  try {
    body = (await req.json()) as Partial<LeadRequest>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const fields = {
    name: String(body.name ?? "").trim(),
    phone: normalizePhone(String(body.phone ?? "")),
    lineId: typeof body.lineId === "string" && body.lineId.trim() ? body.lineId.trim() : undefined,
    preferredChannel: body.preferredChannel === "line" ? ("line" as const) : ("phone" as const),
    question: typeof body.question === "string" && body.question.trim() ? body.question.trim() : undefined,
    consentContact: body.consentContact === true,
  };
  const errors = validateLead(fields);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const catalog = await getCatalog();
  const known = new Set(catalog.products.map((p) => p.id));
  const planList = (v: unknown) => (Array.isArray(v) ? v.filter((id): id is string => typeof id === "string" && known.has(id)).slice(0, 30) : []);

  const ctx = body.context;
  const vehicle = ctx?.vehicle
    ? parseVehicle({ brand: ctx.vehicle.brandId, model: ctx.vehicle.modelId, year: String(ctx.vehicle.year) })
    : null;

  const { reference } = await createLead(await getDb(), {
    name: fields.name,
    phone: fields.phone,
    lineId: fields.lineId,
    preferredChannel: fields.preferredChannel,
    question: fields.question,
    consentMarketing: body.consentMarketing === true,
    context: {
      vehicle,
      usage: parseUsage({ use: ctx?.usage }),
      priorities: parsePriorities({ p: Array.isArray(ctx?.priorities) ? ctx.priorities.join(",") : undefined }),
      selectedPlanIds: planList(ctx?.selectedPlanIds),
      viewedPlanIds: planList(ctx?.viewedPlanIds),
      comparedPlanIds: planList(ctx?.comparedPlanIds),
    },
  });

  return NextResponse.json({ ok: true, reference }, { status: 201 });
}
