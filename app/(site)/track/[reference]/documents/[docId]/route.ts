import { getDocument } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { getDocsBucket } from "@/lib/server/storage";
import { customerApplication } from "@/lib/server/track-auth";

/** Customer download of a file on their own application (e.g. the policy PDF). */
export async function GET(_req: Request, { params }: { params: Promise<{ reference: string; docId: string }> }) {
  const { reference, docId } = await params;
  const app = await customerApplication(reference);
  if (!app) return new Response("Not found", { status: 404 });
  const doc = await getDocument(await getDb(), docId);
  if (!doc || doc.applicationId !== app.id) return new Response("Not found", { status: 404 });
  const obj = await (await getDocsBucket()).get(doc.r2Key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
