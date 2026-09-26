"use server";

import { redirect } from "next/navigation";
import { normalizePlate, validateBuyForm, type BuyErrors, type BuyFormInput } from "@/lib/applications/validate";
import { recordEvent } from "@/lib/db/analytics";
import { notifyStaff } from "@/lib/server/notify";
import { purchaseEnabled } from "@/lib/server/features";
import { createApplication, getApplicationByReference } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { normalizePhone } from "@/lib/leads";
import { quoteForProduct } from "@/lib/quote";
import { getCatalog } from "@/lib/server/catalog";
import { grantAccess, throttled } from "@/lib/server/track-auth";
import { resolveVehicle } from "@/lib/vehicle";

export interface BuyState {
  errors: BuyErrors & { form?: string };
  values: Partial<BuyFormInput>;
}

const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").slice(0, max);

export async function submitApplication(_prev: BuyState, formData: FormData): Promise<BuyState> {
  if (!(await purchaseEnabled())) redirect("/advisor");
  const values: BuyFormInput = {
    customerName: s(formData, "customerName", 100),
    phone: s(formData, "phone", 20),
    email: s(formData, "email", 200),
    address: s(formData, "address", 500),
    plateNumber: s(formData, "plateNumber", 20),
    province: s(formData, "province", 40),
    coverageStart: s(formData, "coverageStart", 10),
    commercialUse: s(formData, "commercialUse", 3),
    consentData: formData.get("consentData") === "on",
    consentInsurer: formData.get("consentInsurer") === "on",
    consentTruthful: formData.get("consentTruthful") === "on",
  };
  const errors = validateBuyForm(values);
  if (Object.keys(errors).length > 0) return { errors, values };
  if (await throttled("buy", 5)) return { errors: { form: "rate_limited" }, values };

  // Never trust the price from the browser: re-quote on the server from the catalogue.
  const catalog = await getCatalog();
  const productId = s(formData, "productId", 100);
  const year = Number(formData.get("year"));
  const vehicle = resolveVehicle(catalog, { brandId: s(formData, "brand", 50), modelId: s(formData, "model", 100), year });
  const result = vehicle ? quoteForProduct(catalog, productId, vehicle) : null;
  if (!vehicle || !result || result.status !== "ok") return { errors: { form: "plan_unavailable" }, values };

  const db = await getDb();
  const { id, reference, token } = await createApplication(db, {
    quote: result.quote,
    vehicle,
    customerName: values.customerName.trim(),
    phone: normalizePhone(values.phone),
    email: values.email.trim() || null,
    address: values.address.trim(),
    plateNumber: normalizePlate(values.plateNumber),
    province: values.province,
    coverageStart: values.coverageStart,
    consentMarketing: formData.get("consentMarketing") === "on",
  });
  await recordEvent(db, "application_submitted").catch(() => {});
  await notifyStaff({ kind: "application", reference, path: `/admin/applications/${id}` }).catch(() => {});
  const created = await getApplicationByReference(db, reference);
  if (created) await grantAccess(created);
  redirect(`/track/${reference}?t=${encodeURIComponent(token)}&new=1`);
}
