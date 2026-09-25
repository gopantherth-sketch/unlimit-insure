import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { BodyType, Coverage, Eligibility, InsuranceType, Powertrain, PricingRule, VerificationStatus } from "@/lib/types";

// Cloudflare D1 (SQLite). Timestamps are ISO-8601 text; structured product terms are JSON text.
// Product terms are versioned and never edited once published (PROJECT_MASTER.md §27–29).

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;
const createdAt = () => text("created_at").notNull().default(now);

export const insurers = sqliteTable("insurers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  accent: text("accent").notNull(),
  claimsHotline: text("claims_hotline"),
  logoKey: text("logo_key"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const vehicleBrands = sqliteTable("vehicle_brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameTh: text("name_th").notNull(),
});

export const vehicleModels = sqliteTable(
  "vehicle_models",
  {
    id: text("id").primaryKey(),
    brandId: text("brand_id").notNull().references(() => vehicleBrands.id),
    name: text("name").notNull(),
    bodyType: text("body_type").$type<BodyType>().notNull(),
    powertrain: text("powertrain").$type<Powertrain>().notNull(),
    newPrice: integer("new_price").notNull(),
    yearFrom: integer("year_from").notNull(),
    yearTo: integer("year_to").notNull(),
  },
  (t) => [index("vehicle_models_brand_idx").on(t.brandId)],
);

export const sourceDocuments = sqliteTable("source_documents", {
  id: text("id").primaryKey(),
  insurerId: text("insurer_id").references(() => insurers.id),
  name: text("name").notNull(),
  /** R2 object key once uploaded. */
  storageKey: text("storage_key"),
  note: text("note"),
  createdAt: createdAt(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  insurerId: text("insurer_id").notNull().references(() => insurers.id),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  insuranceType: text("insurance_type").$type<InsuranceType>().notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export type VersionStatus = "draft" | "published" | "retired";

export const productVersions = sqliteTable(
  "product_versions",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull().references(() => products.id),
    version: integer("version").notNull(),
    status: text("status").$type<VersionStatus>().notNull().default("draft"),
    effectiveFrom: text("effective_from").notNull(),
    effectiveUntil: text("effective_until").notNull(),
    coverage: text("coverage", { mode: "json" }).$type<Coverage>().notNull(),
    pricing: text("pricing", { mode: "json" }).$type<PricingRule>().notNull(),
    eligibility: text("eligibility", { mode: "json" }).$type<Eligibility>().notNull(),
    benefits: text("benefits", { mode: "json" }).$type<string[]>().notNull(),
    suitableFor: text("suitable_for", { mode: "json" }).$type<string[]>().notNull(),
    sourceStatus: text("source_status").$type<VerificationStatus>().notNull().default("pending"),
    sourceDocumentId: text("source_document_id").references(() => sourceDocuments.id),
    sourceDocumentName: text("source_document_name").notNull(),
    sourcePage: integer("source_page"),
    sourceNote: text("source_note"),
    verifiedBy: text("verified_by"),
    verifiedAt: text("verified_at"),
    publishedAt: text("published_at"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("product_versions_product_version_uq").on(t.productId, t.version),
    index("product_versions_status_idx").on(t.status),
  ],
);

export type AdminRole = "owner" | "staff";

/**
 * Admin accounts. The ADMIN_USERNAME / ADMIN_PASSWORD secret login is a separate break-glass owner
 * and is not stored here. `session_version` is bumped on password reset or disable, which ends
 * every existing session for that user.
 */
export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  /** Lower-case. */
  username: text("username").notNull().unique(),
  /** pbkdf2-sha256$<iterations>$<salt b64>$<hash b64> */
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<AdminRole>().notNull().default("staff"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
  sessionVersion: integer("session_version").notNull().default(1),
  lastLoginAt: text("last_login_at"),
  createdBy: text("created_by"),
  createdAt: createdAt(),
  updatedAt: text("updated_at").notNull().default(now),
});

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface LeadContextJson {
  vehicle: { brandId: string; modelId: string; year: number } | null;
  usage?: string;
  priorities: string[];
  selectedPlanIds: string[];
  viewedPlanIds: string[];
  comparedPlanIds: string[];
}

export const leads = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    lineId: text("line_id"),
    preferredChannel: text("preferred_channel").$type<"phone" | "line">().notNull(),
    question: text("question"),
    status: text("status").$type<LeadStatus>().notNull().default("new"),
    context: text("context", { mode: "json" }).$type<LeadContextJson>().notNull(),
    /** admin_users.id of the person responsible, or null. */
    assignedTo: text("assigned_to"),
    createdAt: createdAt(),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [index("leads_status_idx").on(t.status), index("leads_created_idx").on(t.createdAt), index("leads_assigned_idx").on(t.assignedTo)],
);

export type ConsentPurpose = "contact" | "marketing";

/** Consent log: one row per purpose per capture. Never updated; a withdrawal is a new row with granted = false. */
export const consents = sqliteTable(
  "consents",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull().references(() => leads.id),
    purpose: text("purpose").$type<ConsentPurpose>().notNull(),
    granted: integer("granted", { mode: "boolean" }).notNull(),
    wording: text("wording").notNull(),
    wordingVersion: text("wording_version").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("consents_lead_idx").on(t.leadId)],
);

export const leadActivities = sqliteTable(
  "lead_activities",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull().references(() => leads.id),
    type: text("type").$type<"created" | "status_changed" | "note" | "assigned">().notNull(),
    note: text("note"),
    /** Display name at the time of the action ("customer" for the lead form). */
    actor: text("actor").notNull(),
    /** admin_users.id, or null for the customer and the break-glass owner login. */
    actorUserId: text("actor_user_id"),
    createdAt: createdAt(),
  },
  (t) => [index("lead_activities_lead_idx").on(t.leadId)],
);

export const quoteSnapshots = sqliteTable("quote_snapshots", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").references(() => leads.id),
  productVersionId: text("product_version_id").notNull().references(() => productVersions.id),
  vehicle: text("vehicle", { mode: "json" }).$type<{ brandId: string; modelId: string; year: number }>().notNull(),
  premium: integer("premium").notNull(),
  sumInsured: integer("sum_insured").notNull(),
  coverage: text("coverage", { mode: "json" }).$type<Coverage>().notNull(),
  benefits: text("benefits", { mode: "json" }).$type<string[]>().notNull(),
  source: text("source", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  capturedBy: text("captured_by").$type<"system" | "advisor">().notNull(),
  capturedAt: text("captured_at").notNull().default(now),
});

/**
 * Anonymous funnel counters: one row per day × event × dimension. No user, session, IP or device data.
 * `dim` is an allowlisted value (a glossary term, scenario, insurance type) or "".
 */
export const eventCounts = sqliteTable(
  "event_counts",
  {
    day: text("day").notNull(),
    name: text("name").notNull(),
    dim: text("dim").notNull().default(""),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.name, t.dim] })],
);
