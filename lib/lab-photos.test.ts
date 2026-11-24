import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { labArticles } from "@/content/lab";
import { LAB_SHARE_SIZE, labPhotoSlot, labShareImage } from "./lab-photos";

/** Width and height from a baseline or progressive JPEG's SOF marker. */
function jpegSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  let i = 2;
  while (i < b.length) {
    const marker = b.readUInt8(i + 1);
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error(`no size in ${file}`);
}

describe("Lab share images (UNL#53)", () => {
  it.each(labArticles.map((a) => a.slug))("%s has a photo and a 1200×630 share image", (slug) => {
    expect(labPhotoSlot[slug]).toBeDefined();
    const path = labShareImage(slug);
    expect(path).toBe(`/og/lab/${slug}.jpg`);
    const file = join("public", path!);
    expect(existsSync(file), `${file} missing: run npm run og:lab`).toBe(true);
    expect(jpegSize(file)).toEqual(LAB_SHARE_SIZE);
  });

  it("has no photo entry for an article that does not exist", () => {
    const slugs = new Set(labArticles.map((a) => a.slug));
    expect(Object.keys(labPhotoSlot).filter((s) => !slugs.has(s))).toEqual([]);
  });
});
