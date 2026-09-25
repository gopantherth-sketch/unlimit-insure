import { homeCopy } from "@/content/home";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading id="how-title" eyebrow="How Unlimit works" title="เริ่มจากรถของคุณ ไม่ใช่ศัพท์ประกัน" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {homeCopy.howItWorks.map((step, i) => (
            <li key={step.title} className="relative rounded-card border border-navy-100 bg-white p-5">
              <span className="tabular inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-bold text-navy-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
