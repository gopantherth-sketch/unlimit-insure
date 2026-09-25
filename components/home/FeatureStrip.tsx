import { CarFront, Droplet, FileText, Headset, Wrench } from "lucide-react";
import { homeCopy } from "@/content/home";
import { cx } from "@/lib/cx";

const icons = [CarFront, Wrench, Droplet, Headset, FileText];

/** Five outlined icons, no cards (mockup §4). Options vary by plan, so each carries its caveat. */
export function FeatureStrip() {
  return (
    <section aria-label="ความคุ้มครองที่เลือกได้" className="bg-white pb-12 sm:pb-16">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {homeCopy.quickFeatures.map((f, i) => {
          const Icon = icons[i] ?? CarFront;
          const last = i === homeCopy.quickFeatures.length - 1;
          return (
            <li key={f.title} className={cx("flex flex-col items-center text-center", last && "col-span-2 sm:col-span-1")}>
              <Icon aria-hidden className="h-10 w-10 text-brand-600 sm:h-11 sm:w-11" strokeWidth={1.5} />
              <p className="mt-3 max-w-[12em] text-base font-medium leading-snug text-navy-800 sm:text-[17px]">{f.title}</p>
              {f.note && <p className="mt-1 text-[13px] text-navy-400">({f.note})</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
