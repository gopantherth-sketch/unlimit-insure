import type {
  Catalog,
  Eligibility,
  Product,
  ProductVersion,
  Quote,
  QuoteSnapshot,
  ResolvedVehicle,
} from "@/lib/types";

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

export function activeVersion(product: Product, on: Date): ProductVersion | undefined {
  const day = toIsoDate(on);
  return product.versions.find((v) => v.effectiveFrom <= day && day <= v.effectiveUntil);
}

export function isEligible(e: Eligibility, vehicle: ResolvedVehicle): boolean {
  if (e.minYear !== undefined && vehicle.year < e.minYear) return false;
  if (e.maxAgeYears !== undefined && vehicle.age > e.maxAgeYears) return false;
  if (e.powertrains && !e.powertrains.includes(vehicle.model.powertrain)) return false;
  if (e.bodyTypes && !e.bodyTypes.includes(vehicle.model.bodyType)) return false;
  return true;
}

export function price(version: ProductVersion, vehicle: ResolvedVehicle): { premium: number; sumInsured: number } {
  const rule = version.pricing;
  if (rule.kind === "fixed") {
    return { premium: rule.premiumByBody[vehicle.model.bodyType], sumInsured: rule.sumInsured };
  }
  const sumInsured = Math.round((vehicle.estimatedValue * rule.sumInsuredRatio) / 10_000) * 10_000;
  const premium = Math.round(Math.max(rule.minPremium, sumInsured * rule.rate) / 10) * 10;
  return { premium, sumInsured };
}

export function quoteId(versionId: string, vehicle: ResolvedVehicle): string {
  return `${versionId}__${vehicle.modelId}__${vehicle.year}`;
}

function buildQuote(catalog: Catalog, product: Product, version: ProductVersion, vehicle: ResolvedVehicle, now: Date): Quote | null {
  const insurer = catalog.insurers.find((i) => i.id === product.insurerId);
  if (!insurer) return null;
  const { premium, sumInsured } = price(version, vehicle);
  return {
    id: quoteId(version.id, vehicle),
    productId: product.id,
    productVersionId: version.id,
    insurer,
    product,
    version,
    premium,
    sumInsured,
    coverage: version.coverage,
    createdAt: now.toISOString(),
  };
}

/** All eligible, currently effective offers for a vehicle. */
export function generateQuotes(catalog: Catalog, vehicle: ResolvedVehicle, now: Date = new Date()): Quote[] {
  const quotes: Quote[] = [];
  for (const product of catalog.products) {
    const version = activeVersion(product, now);
    if (!version || !isEligible(version.eligibility, vehicle)) continue;
    const q = buildQuote(catalog, product, version, vehicle, now);
    if (q) quotes.push(q);
  }
  return quotes;
}

export type ProductQuoteResult =
  | { status: "ok"; quote: Quote }
  | { status: "notFound" }
  | { status: "noActiveVersion"; product: Product }
  | { status: "ineligible"; product: Product; version: ProductVersion };

export function quoteForProduct(catalog: Catalog, productId: string, vehicle: ResolvedVehicle, now: Date = new Date()): ProductQuoteResult {
  const product = catalog.products.find((p) => p.id === productId);
  if (!product) return { status: "notFound" };
  const version = activeVersion(product, now);
  if (!version) return { status: "noActiveVersion", product };
  if (!isEligible(version.eligibility, vehicle)) return { status: "ineligible", product, version };
  const quote = buildQuote(catalog, product, version, vehicle, now);
  return quote ? { status: "ok", quote } : { status: "notFound" };
}

export function findProduct(catalog: Catalog, productId: string): Product | undefined {
  return catalog.products.find((p) => p.id === productId);
}

/** Freeze everything the customer saw. Stored on purchase so later product changes never alter it (§28). */
export function snapshotQuote(quote: Quote, vehicle: ResolvedVehicle, capturedBy: QuoteSnapshot["capturedBy"] = "system"): QuoteSnapshot {
  return structuredClone({
    quoteId: quote.id,
    productVersionId: quote.productVersionId,
    vehicle: { brandId: vehicle.brandId, modelId: vehicle.modelId, year: vehicle.year },
    premium: quote.premium,
    sumInsured: quote.sumInsured,
    coverage: quote.coverage,
    benefits: quote.version.benefits,
    source: quote.version.source,
    capturedAt: new Date().toISOString(),
    capturedBy,
  });
}
