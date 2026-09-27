import { CircleCheck } from "lucide-react";
import { LineChatPreview } from "@/components/brand/LineChatPreview";
import { CallButton, LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import { homeCopy } from "@/content/home";

/**
 * Closing advisor panel (mockup §10). The advisor photo waits for the owner's file, so a LINE chat
 * preview stands in on the right (from sm; phones get the buttons alone).
 */
export function AdvisorCTA() {
  return (
    <section aria-labelledby="advisor-title" className="bg-white pb-16 pt-12 sm:pb-20 sm:pt-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-brand-50 via-[#EAF0FD] to-brand-100/70">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-line-600/10 blur-3xl" />
          <div className="relative grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.45fr_1fr] lg:items-center lg:gap-12 xl:px-12">
            <div>
              <h2 id="advisor-title" className="text-[24px] font-bold leading-[1.4] text-navy-900 sm:text-[28px]">
                {homeCopy.advisorTitle}
                <br />
                {homeCopy.advisorSubtitle}
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {homeCopy.advisorPoints.map((p) => (
                  <li key={p} className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[15px] text-navy-800 shadow-[0_2px_8px_-2px_rgba(11,19,48,0.08)]">
                    <CircleCheck aria-hidden className="h-5 w-5 shrink-0 fill-brand-600 text-white" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-7 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap">
                <LineButton placement="home" message={contact.messages.general} label={contact.labels.lineLong} size="lg" className="w-full px-8 min-[420px]:w-auto" />
                <CallButton placement="home" showNumber size="lg" className="w-full min-[420px]:w-auto" />
              </div>
            </div>
            <LineChatPreview className="mx-auto hidden w-full max-w-[340px] rotate-[1.5deg] sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
