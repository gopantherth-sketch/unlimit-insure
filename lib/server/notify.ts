import { getCloudflareContext } from "@opennextjs/cloudflare";
import { alertConfigFromEnv, sendAlert, type AlertConfig, type ChannelResult, type StaffAlert } from "@/lib/notify/alerts";
import { publicOrigin } from "@/lib/server/origin";

async function context(): Promise<{ cfg: AlertConfig; waitUntil?: (p: Promise<unknown>) => void }> {
  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    return { cfg: alertConfigFromEnv({ ...process.env, ...(env as unknown as Record<string, string | undefined>) }), waitUntil: (p) => ctx.waitUntil(p) };
  } catch {
    return { cfg: alertConfigFromEnv(process.env) };
  }
}

/** Which channels are switched on (for the settings page). Never exposes the secret values. */
export async function alertChannels(): Promise<{ line: boolean; email: boolean }> {
  const { cfg } = await context();
  return { line: !!cfg.line, email: !!cfg.email };
}

/** Fire-and-forget staff alert: runs after the response via waitUntil, so a slow or failing channel never blocks the customer. */
export async function notifyStaff(alert: StaffAlert): Promise<void> {
  const { cfg, waitUntil } = await context();
  if (!cfg.line && !cfg.email) return;
  const origin = await publicOrigin();
  const job = sendAlert(cfg, alert, origin).then((results) => {
    for (const r of results) if (!r.ok) console.error(`staff alert failed: ${r.channel} ${r.status ?? "network"} (${alert.kind})`);
  });
  if (waitUntil) waitUntil(job);
  else await job;
}

/** Owner "send test" button: waits for the result so the page can show it. */
export async function sendTestAlert(): Promise<ChannelResult[]> {
  const { cfg } = await context();
  return sendAlert(cfg, { kind: "test", reference: "TEST", path: "/admin/settings" }, await publicOrigin());
}
