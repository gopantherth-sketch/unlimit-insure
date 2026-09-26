// Application (purchase) lifecycle. Single source of truth for statuses, who acts, and allowed moves.
// PROJECT_MASTER.md §17–18: every step says whether Unlimit, the customer or the insurer controls it.

export const applicationStatuses = [
  "documents_pending",
  "submitted",
  "needs_info",
  "awaiting_payment",
  "payment_submitted",
  "sent_to_insurer",
  "policy_issued",
  "rejected",
  "cancelled",
] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export const documentKinds = ["registration", "driving_license", "id_card", "vehicle_photo", "payment_slip", "policy", "other"] as const;
export type DocumentKind = (typeof documentKinds)[number];

/** Documents the customer must upload before sending the application for review. */
export const requiredCustomerDocuments: DocumentKind[] = ["registration", "driving_license", "id_card"];
/** Kinds a customer may upload (policy is staff-only). */
export const customerUploadKinds: DocumentKind[] = ["registration", "driving_license", "id_card", "vehicle_photo", "payment_slip", "other"];

export type Actor = "customer" | "unlimit" | "insurer";

/** The five customer-facing steps of the timeline, with who controls each. */
export const timelineSteps: { id: "apply" | "review" | "payment" | "insurer" | "issued"; actor: Actor }[] = [
  { id: "apply", actor: "customer" },
  { id: "review", actor: "unlimit" },
  { id: "payment", actor: "customer" },
  { id: "insurer", actor: "insurer" },
  { id: "issued", actor: "insurer" },
];

/** Which timeline step each status sits on. */
export const statusStep: Record<ApplicationStatus, (typeof timelineSteps)[number]["id"] | null> = {
  documents_pending: "apply",
  submitted: "review",
  needs_info: "review",
  awaiting_payment: "payment",
  payment_submitted: "payment",
  sent_to_insurer: "insurer",
  policy_issued: "issued",
  rejected: null,
  cancelled: null,
};

type Mover = "customer" | "staff";

/** Allowed transitions and who may make them. Anything not listed is refused. */
export const transitions: Record<ApplicationStatus, Partial<Record<ApplicationStatus, Mover[]>>> = {
  documents_pending: { submitted: ["customer"], cancelled: ["customer", "staff"] },
  submitted: { needs_info: ["staff"], awaiting_payment: ["staff"], rejected: ["staff"], cancelled: ["staff"] },
  needs_info: { submitted: ["customer"], cancelled: ["customer", "staff"] },
  awaiting_payment: { payment_submitted: ["customer"], needs_info: ["staff"], cancelled: ["customer", "staff"] },
  payment_submitted: { sent_to_insurer: ["staff"], awaiting_payment: ["staff"], cancelled: ["staff"] },
  sent_to_insurer: { policy_issued: ["staff"], needs_info: ["staff"], rejected: ["staff"] },
  policy_issued: {},
  rejected: {},
  cancelled: {},
};

export function canMove(from: ApplicationStatus, to: ApplicationStatus, who: Mover): boolean {
  return transitions[from][to]?.includes(who) ?? false;
}

export const terminalStatuses: ApplicationStatus[] = ["policy_issued", "rejected", "cancelled"];
