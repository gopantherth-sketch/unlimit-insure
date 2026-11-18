# Shop, Option 1: order on LINE, pay by PromptPay

Owner decision, 2026-11-17: sell car-care products (microfiber cloths first) on unlimitinsure.com as **real sales**, not affiliate links. Customers order on LINE and pay by PromptPay; an admin confirms the slip and ships. There is no on-site checkout or payment provider (that was Option 2; revisit when slip checking by hand gets too much).

Backlog rows: **C14** (build), **C15** (launch), **W13** (copy), **D10** (design), **O12** (owner details), **O13** (outside checks).

## What the customer sees
1. `/shop`: product cards with the owner's own photos, name, short description and the **real price** (incl. VAT if registered).
2. `/shop/[slug]`: photos, description, variant picker (size / colour), quantity, item total, and a green "สั่งซื้อทาง LINE" button (#06803B, white text).
3. The button opens LINE (@unlimit.insure) with a prefilled order. One detail per line, so admins can scan it:
   ```
   สั่งซื้อสินค้า (จากเว็บไซต์)
   สินค้า: ผ้าไมโครไฟเบอร์ [ชื่อรุ่น]
   แบบ: [ขนาด / สี]
   จำนวน: 2
   ราคา: 2 × [ราคา] = [รวม] บาท
   ค่าส่ง: (แอดมินแจ้ง)
   ```
   - The first line differs from the insurance message ("ขอราคาประกันรถยนต์ (จากเว็บไซต์)") so admins can filter shop chats.
   - No name, phone or address in the prefilled text. The admin asks for the delivery address in the LINE chat.
   - The wording here is a placeholder; Gemini drafts the final labels (W13).
4. In LINE the admin sends the total with shipping and a PromptPay QR, the customer sends the slip, and the admin ships and sends the tracking number.

## What admins get (back office, `/admin`)
- **คำสั่งซื้อ (Orders)** page. The admin creates the order from the LINE message: product, variant and quantity; the total comes from the catalogue plus the shipping fee.
- Status: `รอชำระ` → `ชำระแล้ว` → `จัดส่งแล้ว` → `สำเร็จ`, or `ยกเลิก` from any step before `จัดส่งแล้ว`.
- **PromptPay QR with the exact amount** on each order, using the existing `lib/payment/promptpay.ts` and `qr.ts`. The admin saves it and sends it in LINE.
- Stock per variant: it goes down when an order moves to `ชำระแล้ว` and back up if that order is cancelled. A variant at 0 shows "สินค้าหมด" on the site and the LINE button is disabled.
- Fields kept per order: order number, date, items, amounts, shipping fee, status, courier and tracking number, the customer's **LINE display name**, and a short note. **No address, phone or slip image is stored on the site**; those stay in the LINE chat (PDPA: collect the minimum).

## Build notes (C14, Core)
- **Feature flag:** `SHOW_SHOP` in `lib/features.ts`, default `false`. While it's off, `/shop` returns 404, isn't in the sitemap, and nothing links to it. The admin Orders page works regardless, so it can be tested.
- **Catalogue in D1 (C16, 2026-11-18):** the owner enters products in admin → ร้านค้า → สินค้า: name, short text, paragraphs, variants (SKU fixed, label, price in satang or blank), photo, publish. Photos are resized in the browser (≤ 1600 px, WebP, ≤ 600 KB) and stored in D1 (`shop_photos`), served from `/api/shop/photo/<id>` with a one-year cache; no R2 needed. A SKU used by an order can't be deleted, only set off sale. `/shop` and `/shop/<slug>` now read D1 on each request (one small query). Shop copy (headings, steps, order message) stays in `content/shop.ts`. Migration `0005_shop_catalog` keeps the old placeholder `microfiber-cloth` / `MF-01`, unpublished.
- **Migration** `0004_shop.sql`, three tables:
  - `shop_stock` (sku, qty);
  - `shop_orders` (id, number, status, shipping_satang, total_satang, line_name, courier, tracking, note, timestamps);
  - `shop_order_items` (order_id, sku, qty, unit_satang).

  Prices are integer satang. Every status change and its stock update happen in one D1 batch.
- **Analytics:** `shop_view` and `shop_line_click` through the existing events API.
- **SEO when live:** `/shop` and the product pages go in the sitemap, with Product JSON-LD (real price and availability only, no ratings). Link from the footer only at first, so the header stays about insurance.
- **Tests:**
  - vitest: message text, totals, satang rounding, stock down/up on pay/cancel, refused moves (for example `จัดส่งแล้ว` → `รอชำระ`), out-of-stock.
  - New `tests/e2e/shop.mjs`: product page → LINE link text, then admin creates an order → pay → ship.
  - Plus `e2e:a11y`.
- **Checks:** tsc, test, next build, cf:build, `e2e:journey`, `e2e:a11y`, `e2e:shop`.

## Launch (C15)
Turn on `SHOW_SHOP` only when O12 and O13 are done, W13 is approved and D10 has passed. Then add the footer link, request indexing for `/shop`, and place one real test order from the owner's own LINE.

## Rules for the shop
- The shop is separate from insurance. `SHOW_PRICES=false` and `PURCHASE_ENABLED=false` stay insurance-only; the shop shows real product prices.
- No fake reviews, sales counts, "best seller" badges or invented discounts. Photos come from the owner only.
- **No gift or discount tied to buying insurance** (for example "free cloth with every policy") unless the licensed reviewer approves it in writing (O13).
- The seller's name and details on the shop and receipts are exactly what the owner gives (O12). Until then they read `[รอข้อมูล]`.

## Owner: what to send (O12)
1. **Seller identity:** the name to show (yourself or a company), contact address, and tax ID if you have one.
2. **Products:** names, sizes and colours, price per variant, starting stock.
3. **Photos:** your own product photos (several angles, plain background).
4. **Shipping:** courier, fee (flat or by quantity), free-shipping threshold if any, and dispatch time.
5. **Returns:** return / exchange policy (for example, damaged items exchanged within 7 days).
6. **PromptPay:** the receiving PromptPay ID for shop payments (can be the same as O5 or separate). Type it into admin settings yourself; it's not sent in chat.

## Outside checks (O13)
- **Accountant:** DBD e-commerce registration (ทะเบียนพาณิชย์อิเล็กทรอนิกส์), VAT, and what receipt to issue.
- **Licensed reviewer:** OK to sell products on the broker-branded site; confirm there are no gifts or discounts tied to policies.
- **Lawyer / DPO with W4/O8:** the privacy policy's shop section (data stays in LINE; order records kept for accounting, then deleted on a schedule).

## Copy (W13, Gemini drafts, owner approves, Cursor applies)
- `/shop` page title, intro and SEO text.
- Product names and descriptions, from the owner's facts only (size, material, care). No unprovable claims such as "ไม่ทิ้งรอย 100%".
- The prefilled order message labels; keep the first line.
- "สินค้าหมด", order status names, and a delivery and returns section.
- The shop sections for `/privacy` and `/terms`.

## Design (D10, Cursor)
After C14: product card and product page at 390 and 1440 px, the variant and quantity picker, the out-of-stock state, and the admin Orders page. Axe scan clean and no overflow.
