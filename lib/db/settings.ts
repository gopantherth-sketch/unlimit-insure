import { eq, inArray } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";

export const paymentSettingKeys = ["payment.promptpayId", "payment.accountName", "payment.bankName", "payment.bankAccount"] as const;
export type PaymentSettingKey = (typeof paymentSettingKeys)[number];
export type PaymentSettings = Record<PaymentSettingKey, string>;

export async function getPaymentSettings(db: Database): Promise<PaymentSettings> {
  const rows = await db.select().from(settings).where(inArray(settings.key, [...paymentSettingKeys]));
  const out = Object.fromEntries(paymentSettingKeys.map((k) => [k, ""])) as PaymentSettings;
  for (const r of rows) out[r.key as PaymentSettingKey] = r.value;
  return out;
}

export async function setSetting(db: Database, key: PaymentSettingKey | ShopSettingKey, value: string, updatedBy: string): Promise<void> {
  const v = value.trim().slice(0, 200);
  if (!v) {
    await db.delete(settings).where(eq(settings.key, key));
    return;
  }
  await db
    .insert(settings)
    .values({ key, value: v, updatedBy })
    .onConflictDoUpdate({ target: settings.key, set: { value: v, updatedBy, updatedAt: new Date().toISOString() } });
}

/** Payment can be shown to customers only when a PromptPay ID or a bank account is configured. */
export const paymentConfigured = (s: PaymentSettings) => !!s["payment.accountName"] && (!!s["payment.promptpayId"] || (!!s["payment.bankName"] && !!s["payment.bankAccount"]));

/** Shop (C14): its own PromptPay receiver. Empty = fall back to the insurance payment settings. */
export const shopSettingKeys = ["shop.accountName", "shop.promptpayId"] as const;
export type ShopSettingKey = (typeof shopSettingKeys)[number];

export async function getShopPayee(db: Database): Promise<{ promptpayId: string; accountName: string; fromShop: boolean }> {
  const rows = await db.select().from(settings).where(inArray(settings.key, [...shopSettingKeys, "payment.promptpayId", "payment.accountName"]));
  const v = (k: string) => rows.find((r) => r.key === k)?.value ?? "";
  if (v("shop.promptpayId")) return { promptpayId: v("shop.promptpayId"), accountName: v("shop.accountName"), fromShop: true };
  return { promptpayId: v("payment.promptpayId"), accountName: v("payment.accountName"), fromShop: false };
}
