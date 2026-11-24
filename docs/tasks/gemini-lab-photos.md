# Gemini brief: photos for 4 Lab articles

Written by Claude on 2026-11-24 at Nithi's request. On `/lab`, four articles have no photo yet and show the placeholder tile.

How this works:
1. Nithi pastes everything below the line into Gemini (image generation), one image at a time if needed.
2. Nithi sends the 4 images back in chat.
3. Claude converts them to WebP 960×640, adds the photo slots, then prints the GO line.

---

Please make 4 photos for a Thai car-insurance website. Each photo goes on an article card.

Style for all 4 (match these exactly):
- Realistic photo, not an illustration or 3D render.
- Landscape 3:2, at least 1440×960.
- Natural daylight, calm and clean, slightly soft colours.
- Thailand setting: Thai streets, buildings or car parks, cars driving on the left.
- No text, no logos, no brand badges, no readable licence plates, no watermarks.
- No people's faces. Hands or a person seen from behind are fine.
- Nothing scary: no crashes with injuries, smoke, fire or broken glass.

1. **EV claims** (article: "รถ EV เคลมประกันต่างจากรถทั่วไปไหม")
   A clean, modern car repair workshop. A white electric hatchback is on a lift or in a service bay. A technician seen from behind works near the front wheel, and a tablet and tool cart stand nearby. Bright and professional.

2. **BYD EV insurance guide** (article: "ประกันรถไฟฟ้า BYD ควรดูอะไรบ้าง")
   A modern compact electric SUV, unbranded with no logo on the grille or wheels, parked at the home charger in the car port of a Thai townhouse. A charging cable is plugged in. Plants and a late-afternoon warm glow.

3. **Insurance types 1, 2+, 3+, 3** (article: "ประกันชั้น 1, 2+, 3+ และ 3 คุ้มครองอะไรบ้าง")
   A close-up on a desk by a window. A car key, a folded paper document with no readable text, and a pen sit next to a small toy car. Shallow depth of field, calm and orderly.

4. **Both cars insured: who pays** (article: "รถชนกัน มีประกันชั้น 1 ทั้งคู่ ใครจ่าย")
   Two ordinary sedans, one silver and one dark blue, stopped close together at the roadside after a very minor bump, with only a small scuff. Hazard lights on and a warning triangle behind them. Two people seen from behind stand at a safe distance on the pavement, one holding a phone. Daytime city street, calm mood.

Give each image as a separate file, named 1-ev-claims, 2-byd-ev, 3-insurance-types and 4-who-pays.

---

## For Claude (after Nithi sends the images)
- Save the images to `public/images/article-ev-claims.webp`, `article-byd-ev.webp`, `article-types.webp` and `article-who-pays.webp`, as WebP at 960×640, cropped to 3:2.
- Add the slots `articleEvClaims`, `articleBydEv`, `articleTypes` and `articleWhoPays` in `components/brand/Photo.tsx`. Each has a Thai `alt` that describes what is in the photo.
- In `app/(site)/lab/page.tsx` `cardMeta`, set `photo` for `ev-claims`, `byd-ev-insurance`, `insurance-types` and `both-type1-who-pays`.
- Check that nothing in an image breaks the style rules (logo, plate, text, face) before placing it. If something does, ask Nithi for a new image.
