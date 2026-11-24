// Builds the Lab share images (UNL#53): public/og/lab/<slug>.jpg, 1200×630, cropped from each
// article's photo. Run `npm run og:lab` after adding or replacing an article photo.
import sharp from "sharp";
import { join } from "node:path";
import { photos } from "../components/brand/Photo";
import { labPhotoSlot, labShareImage, LAB_SHARE_SIZE } from "../lib/lab-photos";

async function main() {
  for (const [slug, slot] of Object.entries(labPhotoSlot)) {
    const src = join("public", photos[slot].src);
    const out = join("public", labShareImage(slug)!);
    await sharp(src)
      .resize(LAB_SHARE_SIZE.width, LAB_SHARE_SIZE.height, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    console.log(`${out} ← ${src}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
