import { getDb } from "@/lib/db/client";
import { getShopPhoto } from "@/lib/db/shop-catalog";

// Product photos uploaded in admin (C16). A new upload gets a new id, so each URL can be cached for good.
// Served while the shop is off too, so the admin preview works; ids are random and photos are not private.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const photo = await getShopPhoto(await getDb(), id);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(photo.bytes as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": photo.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
