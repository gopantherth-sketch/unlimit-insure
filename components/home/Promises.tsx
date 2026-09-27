import { MessageSquareText, PhoneOff, Timer } from "lucide-react";
import { homeCopy } from "@/content/home";

const icons = [PhoneOff, MessageSquareText, Timer];

/**
 * Replaces the mockup's testimonial carousel (§9). We have no real reviews yet, so we show our
 * commitments instead. Never add quotes, names, star ratings or avatars until reviews are real.
 */
export function Promises() {
  return (
    <section aria-labelledby="promise-title" className="bg-white pb-12 sm:pb-16">
      <div className="container-page">
        <div className="flex flex-col gap-1.5">
          <h2 id="promise-title" className="text-[26px] font-bold text-navy-900 sm:text-[32px]">
            {homeCopy.promiseTitle}
          </h2>
          <p className="text-[15px] text-navy-500">{homeCopy.promiseBody}</p>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {homeCopy.promises.map((p, i) => {
            const Icon = icons[i] ?? PhoneOff;
            return (
              <li key={p.title} className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-wash sm:h-14 sm:w-14">
                  <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">{p.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-navy-600">{p.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
