import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Private R2 bucket for application documents. */
export async function getDocsBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DOCS) throw new Error("R2 binding DOCS is not configured (see wrangler.jsonc)");
  return env.DOCS;
}

export const documentKey = (applicationId: string, documentId: string) => `applications/${applicationId}/${documentId}`;
