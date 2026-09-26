import { homeCopy } from "@/content/home";

/** Light five-step strip: numbered dots on a line, titles with one short line each. */
export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-24 bg-wash pb-14 sm:pb-16">
      <div className="container-page">
        <div className="rounded-2xl border border-white bg-white/70 px-5 py-7 sm:px-8">
          <h2 id="how-title" className="text-lg font-semibold text-navy-900 sm:text-xl">
            {homeCopy.howTitle}
          </h2>
          <ol className="relative mt-6 grid gap-5 sm:grid-cols-5 sm:gap-4">
            <span aria-hidden className="absolute left-[15px] top-4 hidden h-px w-[80%] bg-brand-100 sm:block" />
            {homeCopy.howItWorks.map((step, i) => (
              <li key={step.title} className="relative flex gap-3 sm:block">
                <span className="tabular relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white ring-4 ring-white">
                  {i + 1}
                </span>
                <div className="sm:mt-3">
                  <h3 className="text-base font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-navy-500">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
