import type { MetadataRoute } from "next";
import { labArticles } from "@/content/lab";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/quote", "/lab", "/garage", "/privacy", "/terms", ...labArticles.map((a) => `/lab/${a.slug}`)];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly", priority: p === "/" ? 1 : 0.6 }));
}
