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
  heroTrustPoints: string[];
  quickFeatures: { title: string; note?: string }[];
  howItWorks: { title: string; body: string }[];
  whyTitle: string;
  whyBody: string;
  whyPoints: { title: string; body: string }[];
  compareDemoTitle: string;
  compareDemoBody: string;
  scenarioTitle: string;
  scenarioBody: string;
  labTitle: string;
  labBody: string;
  afterTitle: string;
  afterBody: string;
  afterPoints: { title: string; body: string }[];
  lifestyleQuote: string;
  advisorTitle: string;
  advisorBody: string;
  advisorPoints: string[];
  footerTagline: string;
  /** Claims a licensed person / business owner must confirm before launch. Never rendered. */
  verify?: string[];
}
