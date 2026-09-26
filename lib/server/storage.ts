import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Private R2 bucket for application documents. */
export async function getDocsBucket(): Promise<R2Bucket> {
  // The binding is commented out in wrangler.jsonc while online purchase is off, so it may be absent.
  const docs = ((await getCloudflareContext({ async: true })).env as { DOCS?: R2Bucket }).DOCS;
  if (!docs) throw new Error("R2 binding DOCS is not configured (see wrangler.jsonc)");
  return docs;
}

export const documentKey = (applicationId: string, documentId: string) => `applications/${applicationId}/${documentId}`;
