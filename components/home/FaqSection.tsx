import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/content/faq";

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-canvas py-16 sm:py-20">
      <div className="container-page max-w-3xl">
        <SectionHeading id="faq-title" title="คำถามที่พบบ่อย" align="center" />
        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.question} className="group card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-navy-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
