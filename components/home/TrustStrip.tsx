import { Building2 } from "lucide-react";
import { homeCopy } from "@/content/home";

const TILE_COUNT = 7;

/**
 * Partner insurer strip (mockup §5). We have no licensed insurer logos yet, so every tile is a
 * neutral placeholder. Replace with authorised logos only.
 */
export function TrustStrip() {
  return (
    <section aria-labelledby="partners-title" className="bg-white pb-14 sm:pb-16">
      <div className="container-page">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="partners-title" className="text-[22px] font-bold text-navy-900 sm:text-[28px]">
            {homeCopy.partnersTitle}
          </h2>
          <p className="text-sm text-navy-400">{homeCopy.partnersNote}</p>
        </div>
        <ul className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
          {Array.from({ length: TILE_COUNT }, (_, i) => (
            <li
              key={i}
              className="flex h-[76px] min-w-[128px] snap-start items-center justify-center gap-2 rounded-xl border border-navy-100 bg-white text-[13px] text-navy-300 shadow-[0_1px_2px_rgba(11,19,48,0.04)]"
            >
              <Building2 aria-hidden className="h-5 w-5" strokeWidth={1.5} />
              <span>โลโก้พันธมิตร</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
