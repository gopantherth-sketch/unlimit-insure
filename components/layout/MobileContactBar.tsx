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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-float backdrop-blur sm:hidden"
      >
        <div className="grid grid-cols-2 gap-2">
          <LineButton placement="mobile_bar" className="w-full" />
          <CallButton placement="mobile_bar" className="w-full" />
        </div>
      </nav>
    </>
  );
}
