import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/content/faq";

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 bg-white pt-16 sm:pt-20">
      <div className="container-page max-w-3xl">
        <SectionHeading id="faq-title" title="คำถามที่พบบ่อย" align="center" />
        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.question} className="group overflow-hidden rounded-2xl border border-navy-100 bg-white transition-shadow open:shadow-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-display text-[17px] font-medium text-navy-900 hover:text-brand-700 [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-navy-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
