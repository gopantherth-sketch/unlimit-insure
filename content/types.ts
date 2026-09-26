// Content contract between the product code and the content/copy workstream.
// Content files in /content export data typed with these interfaces. No JSX, no logic.

export type GlossaryKey =
  | "premium"
  | "sumInsured"
  | "excess"
  | "dealerRepair"
  | "garageRepair"
  | "type1"
  | "type2plus"
  | "type3plus"
  | "type3"
  | "collisionWithCounterparty"
  | "collisionNoCounterparty"
  | "fireTheft"
  | "flood"
  | "thirdPartyBodily"
  | "thirdPartyProperty"
  | "personalAccident"
  | "medical"
  | "bailBond"
  | "roadside"
  | "replacementCar"
  | "evBattery"
  | "evCharger"
  | "compulsory";

export interface GlossaryEntry {
  /** Thai term as shown in UI, e.g. "ทุนประกัน" */
  term: string;
  /** Optional English / common alias, e.g. "Sum insured" */
  alias?: string;
  /** One line, ≤ 90 Thai characters. Shown inline as a hint. */
  short: string;
  /** 2–4 short sentences, plain Thai, no jargon. */
  explanation: string;
  /** A concrete real-life example. Use round illustrative numbers and say they are examples. */
  example: string;
  /** Optional caveat, e.g. "ขึ้นอยู่กับเงื่อนไขของแต่ละกรมธรรม์" */
  caveat?: string;
  /** Facts a licensed person must confirm before launch. Never rendered. */
  verify?: string[];
}

export type ScenarioId = "collision" | "noCounterparty" | "flood" | "fire" | "theft" | "evBattery";

export interface ScenarioCopy {
  label: string;
  /** One sentence describing the situation from the driver's point of view. */
  situation: string;
  /** Shown when the plan covers it. */
  coveredText: string;
  /** Shown when it does not. */
  notCoveredText: string;
  verify?: string[];
}

export interface LabSection {
  heading: string;
  /** Paragraphs. Plain text, no HTML/markdown. */
  body: string[];
  /** Optional bullet list shown after the paragraphs. */
  bullets?: string[];
}

export type LabToolId = "typeCompare" | "repairCompare" | "excessCalculator" | "floodCheck" | "evCoverage";

export interface LabArticle {
  slug: string;
  title: string;
  /** ≤ 140 characters, used on cards and meta description. */
  summary: string;
  /** Card CTA label, e.g. "ลองเปรียบเทียบ" */
  ctaLabel: string;
  readMinutes: number;
  tool: LabToolId;
  sections: LabSection[];
  /** Glossary terms to surface at the end of the article. */
  relatedTerms: GlossaryKey[];
  verify?: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
  verify?: string[];
}

export interface HomeCopy {
  eyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroCta: string;
  /** Three icon trust points under the hero headline; each renders on two lines. */
  heroTrustPoints: { line1: string; line2: string }[];
  quickFeatures: { title: string; note?: string }[];
  partnersTitle: string;
  partnersNote: string;
  whyBody: string;
  whyPoints: { title: string; body: string }[];
  howTitle: string;
  howItWorks: { title: string; body: string }[];
  compareDemoTitle: string;
  compareDemoBody: string;
  scenarioTitle: string;
  scenarioBody: string;
  lifestyleQuote: string;
  lifestyleCta: string;
  articlesTitle: string;
  typeTableTitle: string;
  typeTableCta: string;
  promiseTitle: string;
  promiseBody: string;
  promises: { title: string; body: string }[];
  labTitle: string;
  labBody: string;
  afterTitle: string;
  afterBody: string;
  afterPoints: { title: string; body: string }[];
  advisorTitle: string;
  advisorSubtitle: string;
  advisorPoints: string[];
  footerTagline: string;
  /** Claims a licensed person / business owner must confirm before launch. Never rendered. */
  verify?: string[];
}

// ---- Purchase / application tracking (Phase 3) ----
import type { ApplicationStatus, DocumentKind } from "@/lib/applications/status";

export interface PurchaseCopy {
  /** /buy page */
  buyTitle: string;
  buyIntro: string;
  /** Section headings on the buy form. */
  sections: { plan: string; customer: string; vehicle: string; consent: string };
  /** Premium caveat shown next to the price on /buy and on the tracking page. */
  priceNote: string;
  /** Field helper texts. */
  fieldHints: { name: string; phone: string; email: string; address: string; plate: string; province: string; startDate: string; commercialUse: string };
  /** Shown if the customer says the car is used commercially (not supported online). */
  commercialUseBlocked: string;
  consents: {
    /** Required: process personal data for this application. */
    dataProcessing: string;
    /** Required: share data and documents with the insurer for underwriting and issuing. */
    shareWithInsurer: string;
    /** Required: declaration that the information is true and complete. */
    truthful: string;
    /** Optional marketing consent. */
    marketing: string;
  };
  /** Disclosures shown before submit (short bullet sentences). */
  disclosures: string[];
  submitLabel: string;
  /** After submit: explain the private link. */
  linkCreated: { title: string; body: string; saveHint: string };
  /** Tracking page */
  tracking: {
    title: string;
    phoneCheckTitle: string;
    phoneCheckBody: string;
    lostLink: string;
    /** Label for who acts at each step. */
    actorLabel: Record<"customer" | "unlimit" | "insurer", string>;
    stepLabel: Record<"apply" | "review" | "payment" | "insurer" | "issued", string>;
    /** Status badge: the customer has something to do / is waiting on someone else. */
    yourTurn: string;
    waiting: string;
    /** "ขั้นที่ {n} จาก {total}" on the compact mobile timeline. */
    stepOf: string;
  };
  /** Buy page: documents to have ready for the next step. */
  prepareTitle: string;
  prepareBody: string;
  /** Customer-facing status headline and explanation. */
  statusText: Record<ApplicationStatus, { title: string; body: string }>;
  documents: Record<DocumentKind, { label: string; hint: string }>;
  uploadRules: string;
  payment: { title: string; intro: string; steps: string[]; afterUpload: string; priceChanged: string };
  policyIssued: { title: string; body: string; claimsHint: string; renewalHint: string };
  verify: string[];
}
