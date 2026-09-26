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
        <div className="grid gap-8 rounded-[24px] bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-6 text-white shadow-float sm:p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">{band.eyebrow}</p>
            <h2 id="line-quote-title" className="mt-3 text-[26px] font-bold leading-snug sm:text-[32px]">
              {band.title}
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-navy-100 sm:text-base">{band.body}</p>
            <ol className="mt-7 grid gap-4 sm:grid-cols-3">
              {band.steps.map((s, i) => (
                <li key={s.title} className="flex gap-3 sm:flex-col">
                  <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-lg font-bold text-white ring-1 ring-white/20">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold">{s.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-navy-200">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <LineButton placement="home" message={contact.messages.general} label={contact.labels.lineLong} size="lg" className="px-7" />
              <CallButton placement="home" showNumber size="lg" variant="onDark" />
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <a
              href={lineAddUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-3xl bg-white p-5 text-center text-navy-900 shadow-float transition-transform hover:-translate-y-0.5"
            >
              <span className="block" dangerouslySetInnerHTML={{ __html: qrSvg(lineAddUrl, 184).replace('role="img"', 'aria-hidden="true"') }} />
              <span className="mt-3 block text-sm font-semibold">{band.qrCaption}</span>
              <span className="block text-sm text-navy-500">{contact.lineId}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
