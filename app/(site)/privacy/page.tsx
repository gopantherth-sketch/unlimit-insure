import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacyPolicy } from "@/content/legal";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo("/privacy");

export default function PrivacyPage() {
  return <LegalDocument doc={privacyPolicy} />;
}
