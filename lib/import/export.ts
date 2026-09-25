import type { RawRow, RawWorkbook } from "@/lib/import/validate";
import type { Catalog } from "@/lib/types";

const yn = (b: boolean) => (b ? "Y" : "N");

/** Catalogue → import rows (inverse of validateWorkbook). Used for the example file and round-trip tests. */
export function catalogToWorkbook(catalog: Catalog): Required<RawWorkbook> {
  const insurers: RawRow[] = catalog.insurers.map((i) => ({
    insurer_id: i.id,
    name: i.name,
    short_name: i.shortName,
    accent: i.accent,
    claims_hotline: i.claimsHotline ?? null,
  }));
  const vehicles: RawRow[] = catalog.models.map((m) => {
    const b = catalog.brands.find((x) => x.id === m.brandId);
    return {
      brand_id: m.brandId,
      brand_name: b?.name ?? m.brandId,
      brand_name_th: b?.nameTh ?? m.brandId,
      model_id: m.id,
      model_name: m.name,
      body_type: m.bodyType,
      powertrain: m.powertrain,
      new_price: m.newPrice,
      year_from: m.yearFrom,
      year_to: m.yearTo,
    };
  });
  const products: RawRow[] = catalog.products.flatMap((p) =>
    p.versions.map((v) => {
      const c = v.coverage;
      const pr = v.pricing;
      return {
        insurer_id: p.insurerId,
        product_id: p.id,
        product_name: p.name,
        product_summary: p.summary,
        insurance_type: c.insuranceType,
        effective_from: v.effectiveFrom,
        effective_until: v.effectiveUntil,
        repair_type: c.repairType,
        excess: c.excess,
        collision_with_counterparty: yn(c.collisionWithCounterparty),
        collision_no_counterparty: yn(c.collisionNoCounterparty),
        fire_theft: yn(c.fireTheft),
        flood: yn(c.flood),
        tp_bodily_per_person: c.thirdPartyBodilyPerPerson,
        tp_bodily_per_accident: c.thirdPartyBodilyPerAccident,
        tp_property: c.thirdPartyProperty,
        pa_per_person: c.personalAccidentPerPerson,
        medical_per_person: c.medicalPerPerson,
        bail_bond: c.bailBond,
        covered_seats: c.coveredSeats,
        roadside: yn(c.roadsideAssistance),
        replacement_car_days: c.replacementCarDays,
        ev_battery: yn(c.evBattery),
        ev_charger: yn(c.evCharger),
        pricing_kind: pr.kind === "fixed" ? "fixed" : "percent",
        rate_percent: pr.kind === "percentOfValue" ? Math.round(pr.rate * 100 * 1e6) / 1e6 : null,
        min_premium: pr.kind === "percentOfValue" ? pr.minPremium : null,
        sum_insured_percent: pr.kind === "percentOfValue" ? Math.round(pr.sumInsuredRatio * 100 * 1e6) / 1e6 : null,
        fixed_sum_insured: pr.kind === "fixed" ? pr.sumInsured : null,
        premium_sedan: pr.kind === "fixed" ? pr.premiumByBody.sedan : null,
        premium_hatchback: pr.kind === "fixed" ? pr.premiumByBody.hatchback : null,
        premium_suv: pr.kind === "fixed" ? pr.premiumByBody.suv : null,
        premium_pickup: pr.kind === "fixed" ? pr.premiumByBody.pickup : null,
        premium_mpv: pr.kind === "fixed" ? pr.premiumByBody.mpv : null,
        max_age_years: v.eligibility.maxAgeYears ?? null,
        min_year: v.eligibility.minYear ?? null,
        powertrains: v.eligibility.powertrains?.join(",") ?? null,
        body_types: v.eligibility.bodyTypes?.join(",") ?? null,
        benefits: v.benefits.join("; ") || null,
        suitable_for: v.suitableFor.join("; ") || null,
        source_document: v.source.documentName,
        source_page: v.source.page ?? null,
        source_note: v.source.note ?? null,
      };
    }),
  );
  return { insurers, vehicles, products };
}
