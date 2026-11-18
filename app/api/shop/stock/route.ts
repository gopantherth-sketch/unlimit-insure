import { getDb } from "@/lib/db/client";
import { soldOutSkus } from "@/lib/db/shop";
import { SHOW_SHOP } from "@/lib/features";

// Sold-out SKUs for the prebuilt shop pages. Public, anonymous, no customer data. Not cached, so a
// variant set to 0 in admin shows "สินค้าหมด" straight away (one small D1 read per product view).
export async function GET() {
  if (!SHOW_SHOP) return new Response(null, { status: 404 });
  const soldOut = await soldOutSkus(await getDb());
  return Response.json({ soldOut }, { headers: { "cache-control": "no-store" } });
}
