import type { PhotoSlot } from "@/components/brand/Photo";

/**
 * Photo per Lab article: the card thumbnail on /lab and the source of its share image
 * (public/og/lab/<slug>.jpg, 1200×630, built by `npm run og:lab`). Add a new article here
 * and run the script, or its link preview falls back to the site-wide og-image.jpg.
 */
export const labPhotoSlot: Record<string, PhotoSlot> = {
  "type1-vs-2plus": "articleSteering",
  "dealer-vs-garage": "articleRepair",
  "what-is-excess": "articleExcess",
  "flood-cover": "articleFlood",
  "ev-insurance": "articleEv",
  "ev-claims": "articleEvClaims",
  "byd-ev-insurance": "articleBydEv",
  "insurance-types": "articleTypes",
  "both-type1-who-pays": "articleWhoPays",
};

export const LAB_SHARE_SIZE = { width: 1200, height: 630 } as const;

/** Share image path for an article, or null when it has no photo. */
export function labShareImage(slug: string): string | null {
  return labPhotoSlot[slug] ? `/og/lab/${slug}.jpg` : null;
}
