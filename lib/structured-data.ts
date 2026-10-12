// schema.org JSON-LD for search engines. Only facts the site already states: name, URL, logo, page titles.
// No address, phone, ratings or licence numbers until the owner confirms them (honesty rules, HANDOVER.md §6).
import { SITE_URL } from "@/lib/site";

const abs = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

export function siteLd() {
  return [
    { "@context": "https://schema.org", "@type": "WebSite", name: "Unlimit Insure", url: `${SITE_URL}/`, inLanguage: "th-TH" },
    { "@context": "https://schema.org", "@type": "Organization", name: "Unlimit Insure", url: `${SITE_URL}/`, logo: `${SITE_URL}/brand/unlimit-logo-full.png` },
  ];
}

/** Breadcrumb trail; the first item is always the homepage. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  const items = [{ name: "หน้าแรก", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}
