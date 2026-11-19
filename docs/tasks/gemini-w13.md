# Gemini brief: W13 (shop copy)

Paste everything below the line into Gemini, with the two product photos the owner sent on 2026-11-19 (black round sponge, short-pile microfiber cloth). The owner approves Gemini's answer and hands it to Core. Core puts the page text in `content/shop.ts` and `content/seo.ts`, and the product text in admin → ร้านค้า → สินค้า.

Facts below come from the owner (chat 2026-11-19) or from text printed on the owner's own product photos. Anything marked "confirm" is printed on a photo but was not said by the owner: ask before using it.

---

You are the Thai copywriter for the **shop** on **Unlimit Insure** (unlimitinsure.com). The site is a small Thai motor-insurance broker; the shop is a separate corner that sells a few car-care products. Customers choose a product, tap "สั่งซื้อทาง LINE", and LINE opens with the order already typed. An admin replies with the total and a PromptPay QR, the customer sends the slip and address, and we ship.

Tone: plain, friendly, trustworthy Thai; short sentences; no hype. Write gender-neutral (no ครับ/ค่ะ).

Rules (these are fixed):
- **Facts only.** Use only the facts listed here. No "best", "premium", "100%", "ไม่เกิดรอย 100%", "ทนที่สุด" or similar claims, no reviews, no customer numbers.
- **No prices in the text.** The site shows prices from the product data. Don't mention discounts, free shipping, promotions or bundles.
- **No link to insurance.** Don't say the products come with, or give a discount on, insurance, and don't suggest buying insurance to get them.
- **Shipping:** say only that the admin tells the shipping cost in the chat. No delivery times.
- Don't name a seller or brand; the seller line is filled in later.

## Products

**1. ฟองน้ำกลม สีดำ** (owner's name)
- Round black foam pad, sold per piece (variant "1 ชิ้น").
- Use: applying polish and wax (งานขัด งานเคลือบ), from the owner's photo. Confirm.
- Printed on the photo, **not to be used unless the owner confirms**: "ทนและไม่ก่อให้เกิดรอย".

**2. ผ้าไมโครไฟเบอร์แบบขนสั้น 350–400 GSM** (owner's name)
- Short-pile microfiber cloth, 350–400 GSM, size 40×40 ซม. (variant "40×40 ซม.").
- Printed on the photo: velvet-like texture (เนื้อกำมะหยี่), "หนา+1", with edging (มีขอบ). Confirm.
- Two colours appear in the photo (pink, brown). Colour choice is not offered yet: don't mention colours.

## What to write

For each item give **one recommended version** and **one alternative**, each with a one-line reason. Thai only.

1. **Shop page**
   - Intro under the title "ร้านค้า": one or two short sentences, about 70 characters at most. Current: `อุปกรณ์ดูแลรถที่เราเลือกมาเอง สั่งซื้อทาง LINE แล้วชำระด้วยพร้อมเพย์`
   - "How to order" steps: review the three current steps, keep the same order and meaning, at most about 50 characters each:
     1. `เลือกแบบและจำนวน แล้วกด “สั่งซื้อทาง LINE”`
     2. `แอดมินแจ้งยอดรวมค่าส่งและส่ง QR พร้อมเพย์ให้ในแชต`
     3. `ส่งสลิปและที่อยู่จัดส่งในแชต เราแจ้งเลขพัสดุเมื่อส่งของแล้ว`
2. **Search result text for /shop**
   - Title: about 50 characters at most. Current: `ร้านค้า อุปกรณ์ดูแลรถ [รอข้อมูล]`
   - Description: about 120 characters at most. Current: `[รอข้อมูล] สั่งซื้อทาง LINE ชำระด้วยพร้อมเพย์`
3. **Each product**
   - Name: keep the owner's wording unless a small change reads better; about 40 characters at most.
   - Card line (one line under the name): about 40 characters at most.
   - Product page: two or three short paragraphs (what it is, what it's for, size or care). Facts only.
   - Photo description for screen readers (alt text): what the photo shows, about 80 characters at most.
4. **LINE order message**: review the labels. **Do not change the first line** `สั่งซื้อสินค้า (จากเว็บไซต์)`; admins filter chats on it. Keep one detail per line as `label: value`.
   ```
   สั่งซื้อสินค้า (จากเว็บไซต์)
   สินค้า: ฟองน้ำกลม สีดำ
   แบบ: 1 ชิ้น
   จำนวน: 2
   ราคา: 2 × 50 = 100 บาท
   ค่าส่ง: (แอดมินแจ้ง)
   ```

## What to send back
1. Shop page: intro and the three steps.
2. /shop search title and description.
3. Both products: name, card line, product-page paragraphs, alt text.
4. LINE message: keep or changed labels.
5. A list of every fact you used that is marked "Confirm" above, so the owner can tick them.

---

## Approved (owner, 2026-11-19)

Gemini's recommended version of every item. The owner confirmed all four photo facts (sponge: polish and wax; cloth: velvet-like, "หนา+1", edging). "ทนและไม่ก่อให้เกิดรอย" stays out.

Page, search and LINE text are in `content/shop.ts` and `content/seo.ts` (the LINE price line is now "ราคาสินค้า:", so it reads as before shipping).

**For live admin → ร้านค้า → สินค้า** (the owner enters these; paragraphs are separated by a blank line):

**ฟองน้ำกลม สีดำ** · ชื่อในลิงก์ `black-round-sponge` · SKU `SP-BLK-01` · แบบ "1 ชิ้น" · 50 บาท · สต็อก 50
- คำโปรยบนการ์ด: `ฟองน้ำทรงกลมสำหรับงานขัดและงานเคลือบ`
- รายละเอียด:
  ```
  ฟองน้ำทรงกลมสีดำ จำหน่ายแบบแยกชิ้น (ตัวเลือก 1 ชิ้น)

  ใช้สำหรับงานขัดและงานเคลือบสีรถ

  เลือกจำนวนที่ต้องการแล้วกดสั่งซื้อทาง LINE แอดมินจะแจ้งค่าจัดส่งและส่ง QR พร้อมเพย์ให้ในแชต
  ```

**ผ้าไมโครไฟเบอร์แบบขนสั้น 350–400 GSM** · ชื่อในลิงก์ `microfiber-short-350` · SKU `MF-SH350-40` · แบบ "40×40 ซม." · 35 บาท · สต็อก 50
- คำโปรยบนการ์ด: `เนื้อกำมะหยี่ มีขอบ ขนาด 40×40 ซม.`
- รายละเอียด:
  ```
  ผ้าไมโครไฟเบอร์แบบขนสั้น ความหนา 350–400 GSM เนื้อกำมะหยี่ (รุ่น หนา+1) และเย็บมีขอบเรียบร้อย

  ขนาด 40×40 ซม. สำหรับงานดูแลรถ

  กดสั่งซื้อทาง LINE เพื่อระบุจำนวน แอดมินจะแจ้งยอดรวมค่าจัดส่งและส่ง QR พร้อมเพย์ให้ในแชต
  ```

Photo alt text: the site uses the product name as the alt text, so Gemini's alt lines are not used.
