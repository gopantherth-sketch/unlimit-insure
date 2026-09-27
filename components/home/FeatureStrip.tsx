import { CarFront, Droplet, FileText, Headset, Wrench } from "lucide-react";
import { homeCopy } from "@/content/home";

const icons = [CarFront, Wrench, Droplet, Headset, FileText];

/**
 * Five outlined icons, no cards (mockup §4). Options vary by plan, so each carries its caveat.
 * Phones: a compact list with the icon on the left; from sm: centred columns.
 */
export function FeatureStrip() {
  return (
    <section aria-label="ความคุ้มครองที่เลือกได้" className="bg-white pb-12 sm:pb-16">
      <ul className="container-page grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-y-8 lg:grid-cols-5">
        {homeCopy.quickFeatures.map((f, i) => {
          const Icon = icons[i] ?? CarFront;
          return (
            <li key={f.title} className="flex items-center gap-4 sm:flex-col sm:gap-0 sm:text-center">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-wash sm:h-auto sm:w-auto sm:bg-transparent">
                <Icon aria-hidden className="h-7 w-7 text-brand-600 sm:h-11 sm:w-11" strokeWidth={1.5} />
              </span>
              <span className="sm:mt-3">
                <span className="block text-base font-medium leading-snug text-navy-800 sm:mx-auto sm:max-w-[12em] sm:text-[17px]">{f.title}</span>
                {f.note && <span className="mt-0.5 block text-[13px] text-navy-500 sm:mt-1 sm:text-navy-400">({f.note})</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
