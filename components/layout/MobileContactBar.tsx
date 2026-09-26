"use client";

import { usePathname } from "next/navigation";
import { CallButton, LineButton } from "@/components/contact/ContactButtons";

/**
 * Sticky LINE + call bar on small screens, with a spacer so it never covers the footer.
 * Hidden on the quote journey, which has its own sticky actions and compare tray, and a LINE button
 * on every plan.
 */
export function MobileContactBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/quote")) return null;
  return (
    <>
      <div aria-hidden className="h-[76px] sm:hidden" />
      <nav
        aria-label="ติดต่อเรา"
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t border-navy-100 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_-16px_rgba(11,19,48,0.28)] backdrop-blur sm:hidden"
      >
        {/* LINE is the main channel, so it gets the wider column. */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-2">
          <LineButton placement="mobile_bar" className="w-full" />
          <CallButton placement="mobile_bar" className="w-full" />
        </div>
      </nav>
    </>
  );
}
