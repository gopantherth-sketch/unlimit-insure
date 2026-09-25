import type { Metadata } from "next";
import { pageSeo } from "@/content/seo";

/** Page metadata from content/seo.ts. Journey pages carrying a user's car in the URL are noindex. */
export function seo(route: keyof typeof pageSeo | string, opts: { noindex?: boolean } = {}): Metadata {
  const entry = pageSeo[route];
  return {
    ...(entry && { title: entry.title, description: entry.description }),
    alternates: { canonical: route },
    ...(opts.noindex && { robots: { index: false, follow: true } }),
  };
}
