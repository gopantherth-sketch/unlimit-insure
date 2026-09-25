import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";
import { validateLead, type LeadRequest } from "@/lib/leads";
import { parsePriorities, parseUsage, parseVehicle } from "@/lib/params";

const knownPlan = (id: unknown): id is string => typeof id === "string" && products.some((p) => p.id === id);
const planList = (v: unknown) => (Array.isArray(v) ? v.filter(knownPlan).slice(0, 30) : []);

/**
 * Advisor handoff intake.
 * PROTOTYPE: validates and acknowledges only — nothing is stored or forwarded, and personal data is never logged.
 * Production: persist to the CRM (Leads + Activities), notify the advisor queue, record consent with timestamp.
 */
export async function POST(req: Request) {
  let body: Partial<LeadRequest>;
  try {
    body = (await req.json()) as Partial<LeadRequest>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const errors = validateLead({
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    lineId: typeof body.lineId === "string" ? body.lineId : undefined,
    preferredChannel: body.preferredChannel === "line" ? "line" : "phone",
    question: typeof body.question === "string" ? body.question : undefined,
    consentContact: body.consentContact === true,
  });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const ctx = body.context;
  const vehicle = ctx?.vehicle
    ? parseVehicle({ brand: ctx.vehicle.brandId, model: ctx.vehicle.modelId, year: String(ctx.vehicle.year) })
    : null;
  const context = {
    vehicle,
    usage: parseUsage({ use: ctx?.usage }),
    priorities: parsePriorities({ p: Array.isArray(ctx?.priorities) ? ctx.priorities.join(",") : undefined }),
    selectedPlanIds: planList(ctx?.selectedPlanIds),
    viewedPlanIds: planList(ctx?.viewedPlanIds),
    comparedPlanIds: planList(ctx?.comparedPlanIds),
  };

  const reference = `UI-${Date.now().toString(36).toUpperCase()}`;
  return NextResponse.json({ ok: true, reference, stored: false, context }, { status: 202 });
}
