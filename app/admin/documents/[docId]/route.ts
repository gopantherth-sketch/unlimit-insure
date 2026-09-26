import { getDocument } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { currentAdmin } from "@/lib/server/admin-auth";
import { getDocsBucket } from "@/lib/server/storage";

/** Staff view/download of an application document. Images and PDFs open inline. */
export async function GET(req: Request, { params }: { params: Promise<{ docId: string }> }) {
  const who = await currentAdmin();
  if (!who || who.mustChangePassword) return new Response("Unauthorized", { status: 401 });
  const { docId } = await params;
  const doc = await getDocument(await getDb(), docId);
  if (!doc) return new Response("Not found", { status: 404 });
  const obj = await (await getDocsBucket()).get(doc.r2Key);
  if (!obj) return new Response("Not found", { status: 404 });
  const inline = new URL(req.url).searchParams.get("download") !== "1";
  return new Response(obj.body, {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
