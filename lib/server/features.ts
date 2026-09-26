import { getCloudflareContext } from "@opennextjs/cloudflare";

// Online purchase (buy form, tracking uploads) stays off until real products, the broker licence and
// the receiving account are confirmed. Switch on with the Worker variable PURCHASE_ENABLED=true
// (requires the R2 bucket; see docs/deploy.md). Admin pages for applications work either way.
export async function purchaseEnabled(): Promise<boolean> {
  let v: string | undefined;
  try {
    v = ((await getCloudflareContext({ async: true })).env as unknown as Record<string, string | undefined>).PURCHASE_ENABLED;
  } catch {
    // Outside the Worker.
  }
  return (v ?? process.env.PURCHASE_ENABLED) === "true";
}
