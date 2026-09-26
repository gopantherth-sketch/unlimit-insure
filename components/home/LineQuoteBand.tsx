import { CallButton, LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import { lineAddUrl } from "@/lib/contact";
import { qrSvg } from "@/lib/payment/qr";

/**
 * "Get a real quote on LINE" band for the LINE-first launch. Takes the partner-logo strip's place
 * until licensed insurer logos exist. The QR (add-friend link) is for desktop visitors.
 */
export function LineQuoteBand() {
  const band = contact.quoteBand;
  return (
    <section aria-labelledby="line-quote-title" className="bg-white pb-14 sm:pb-16">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[24px] bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-6 text-white shadow-float sm:p-10">
          {/* Soft light behind the text and the QR card. Decorative. */}
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 -z-10 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 right-[8%] -z-10 h-96 w-96 rounded-full bg-line-600/25 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">{band.eyebrow}</p>
              <h2 id="line-quote-title" className="mt-3 text-[26px] font-bold leading-snug sm:text-[32px]">
                {band.title}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-navy-100 sm:text-base">{band.body}</p>
              <ol className="relative mt-7 grid gap-4 sm:grid-cols-3">
                {/* Connector: vertical on phones, horizontal from sm. */}
                <span aria-hidden className="absolute bottom-5 left-5 top-5 w-px bg-white/15 sm:hidden" />
                <span aria-hidden className="absolute left-5 right-[33%] top-5 hidden h-px bg-white/15 sm:block" />
                {band.steps.map((s, i) => (
                  <li key={s.title} className="relative flex gap-3 sm:flex-col">
                    <span
                      aria-hidden
                      className={
                        i === 0
                          ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-line-600 font-display text-lg font-bold text-white ring-4 ring-navy-800"
                          : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-navy-700 font-display text-lg font-bold text-white ring-4 ring-navy-800"
                      }
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold">{s.title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-navy-200">{s.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap">
                <LineButton placement="home" message={contact.messages.general} label={contact.labels.lineLong} size="lg" className="w-full px-7 min-[420px]:w-auto" />
                <CallButton placement="home" showNumber size="lg" variant="onDark" className="w-full min-[420px]:w-auto" />
              </div>
            </div>
            <div className="hidden justify-center lg:flex">
              <a
                href={lineAddUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-3xl bg-white p-5 text-center text-navy-900 shadow-float ring-8 ring-white/10 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="block" dangerouslySetInnerHTML={{ __html: qrSvg(lineAddUrl, 184).replace('role="img"', 'aria-hidden="true"') }} />
                <span className="mt-3 block text-sm font-semibold">{band.qrCaption}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-line-50 px-3 py-1 text-sm font-medium text-line-700">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-line-600" />
                  {contact.lineId}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
