import type { MetadataRoute } from "next";
import { labArticles } from "@/content/lab";
import { models } from "@/lib/data/vehicles";
import { modelPages } from "@/content/models";
import { SHOW_AFTER_PURCHASE } from "@/lib/features";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Model pages: content exists for these ids; brand comes from the vehicle list.
  const modelPaths = modelPages
    .map((p) => models.find((m) => m.id === p.modelId))
    .filter((m) => m !== undefined)
    .map((m) => `/insurance/${m.brandId}/${m.id}`);
  const paths = ["/", "/quote", "/lab", ...(SHOW_AFTER_PURCHASE ? ["/garage"] : []), "/claims", "/insurance", "/privacy", "/terms", ...labArticles.map((a) => `/lab/${a.slug}`), ...modelPaths];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly", priority: p === "/" ? 1 : 0.6 }));
}
