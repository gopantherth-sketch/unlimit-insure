import { CalendarClock, Droplets, LifeBuoy, ShieldCheck, Wrench } from "lucide-react";
import { homeCopy } from "@/content/home";

const icons = [ShieldCheck, Wrench, Droplets, LifeBuoy, CalendarClock];

export function FeatureStrip() {
  return (
    <section aria-label="ความคุ้มครองที่เลือกได้" className="bg-canvas">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-8 pb-14 sm:grid-cols-3 lg:grid-cols-5">
        {homeCopy.quickFeatures.map((f, i) => {
          const Icon = icons[i] ?? ShieldCheck;
          return (
            <li key={f.title} className="flex flex-col items-center text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card">
                <Icon aria-hidden className="h-6 w-6" />
              </span>
              <p className="mt-3 text-[15px] font-semibold text-navy-800">{f.title}</p>
              {f.note && <p className="mt-0.5 text-xs text-navy-400">({f.note})</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
