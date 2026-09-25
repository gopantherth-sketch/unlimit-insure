import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteWizard } from "@/components/quote/QuoteWizard";

export const metadata: Metadata = { title: "เช็กประกันสำหรับรถของคุณ" };

export default function QuotePage() {
  return (
    <div className="bg-canvas">
      <Suspense>
        <QuoteWizard />
      </Suspense>
    </div>
  );
}
