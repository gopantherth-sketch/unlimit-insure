# Design System

Blue/white fintech direction (PROJECT_MASTER.md §6, §37). Visual target: `design/mockups/homepage-selected.webp` (spec: `design/mockup-spec.md`). Tokens live in `tailwind.config.ts`; component classes in `app/globals.css`.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `brand-600` | `#1016D1` | Primary actions, links, accents — sampled from the logo ring |
| `brand-700` / `800` | `#0D12A8` / `#0B0F82` | Hover / pressed |
| `brand-50` / `100` | `#EEF0FF` / `#DDE1FF` | Tinted surfaces, chips, icon tiles |
| `navy-900` | `#0B1330` | Headlines, body text, footer bar |
| `navy-500` | `#4C5A7E` | Secondary text |
| `navy-100` | `#E6EAF3` | Borders, dividers |
| `canvas` | `#F7F8FC` | Page background for app screens |
| `wash` | `#F3F6FD` | Homepage section washes (Why Unlimit, lifestyle band, After you buy), table header rows |
| `line-600` | `#06803B` | LINE buttons and LINE accents (white text AA 5.3:1). `line-700` / `800` hover / pressed; `line-50` / `100` / `200` tinted surfaces and borders. Never put text on the lighter LINE green `#06C755` |
| `success-*` | `#12805C` | Covered / best value; `success-500` `#16A34A` fills the table check circle |
| `warning-*` | `#B45309` | Excess, mock-data labels, renewal due |
| `danger-600` | `#C0263A` | Errors (sparingly); `danger-500` `#DC2626` is the red ✕ in comparison tables only |

Gradients: only soft `brand-50 → wash/white` washes (Smart Compare summary, advisor panel) and photo fades into the page. No stacked gradients, no dark bands except the LINE quote band and the footer bar.

## Typography

Three faces, loaded with `next/font/google` in `app/layout.tsx`:

- **Prompt** 500–800 (`font-display`, `--font-display`) — heavy rounded-geometric Thai display. Applied to every `h1`–`h3` in `globals.css`, the logo wordmark and a few display numbers.
- **IBM Plex Sans Thai** 400–700 (`font-sans`) — body, labels, tables.
- **Allura** (`font-script`, `.script-accent`) — handwritten English accents in brand blue. Exactly four on the homepage: "Drive / With Confidence" (hero), "More / Than Insurance" (lifestyle), "We're / Here for You" (advisor). Always `aria-hidden`, via `<ScriptAccent>` in `components/brand/Photo.tsx`.

| Role | Size |
| --- | --- |
| Hero H1 | 38 / 52 / 58–62 px (mobile / sm / lg–xl), Prompt bold, 1.18 line-height; line 2 in `brand-600` |
| Why Unlimit H2 | 34 / 42 px |
| Section H2 (`.h-section`) | 26 / 32 px Prompt bold |
| Card title | 18–20 px Prompt semibold/bold |
| Body | 16–17 px, 1.6–1.85 line-height for long Thai text |
| Small / meta | 14 px; 12 px minimum, only for labels |
| Eyebrow (`.eyebrow`) | 12 px, uppercase, 0.18em tracking, brand-600 |

Numbers use `.tabular` (tabular figures).

## Spacing & layout

- Container `.container-page`: max 1200 px, gutters 16 / 24 / 32 px.
- Section rhythm: `py-16` mobile, `py-20` desktop.
- Grid gaps: 12–20 px within cards, 16–24 px between cards.
- Breakpoints: Tailwind defaults — `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Mobile-first.

## Radius & shadow

- Cards `rounded-card` 20 px; inner panels 16 px (`rounded-2xl`); inputs 12 px; buttons and chips fully rounded.
- `shadow-card`: subtle navy shadow for resting cards. `shadow-lift`: blue-tinted for primary buttons, floating panels, hover.

## Components

- **Buttons** (`components/ui/button.ts`): `primary` (solid blue), `secondary` (outlined), `ghost`, `white` (on blue/navy). Sizes `sm` 36 px, `md` 44 px, `lg` 48–56 px. Tap targets ≥ 44 px on mobile. Pills by default; passing a `rounded-*` class (e.g. `rounded-xl`) gives the mockup's rounded-rectangle buttons (header "ปรึกษาฟรี", quick-quote CTA, "ดูเพิ่มเติม").
- **Header**: floating white rounded card (`rounded-2xl`, `shadow-float`) inside a sticky bar with 8–12 px inset. Nav: ประกันรถยนต์ · เช็กเบี้ย · บทความ · บริการหลังการขาย · เกี่ยวกับเรา. "เข้าสู่ระบบ" is shown non-interactive with a "เร็ว ๆ นี้" chip until customer accounts exist.
- **Quick quote card**: tab strip on a pale bar; active tab is white with a 4 px blue top bar. Motor + EV live; มอเตอร์ไซค์ / การเดินทาง / สุขภาพ disabled with "เร็ว ๆ นี้". Selects carry a decorative icon tile (`VehicleSelector withIcons`).
- **Feature row / Why cards**: outlined lucide icons at 40–44 px, stroke 1.5, no tiles.
- **Comparison marks** (`components/ui/CoverMark.tsx`): filled green check circle / red ✕, with `role="img"` labels.
- **Footer**: white, logo + tagline, 3 link columns + ติดต่อเรา (placeholders "[รอข้อมูล]") and non-interactive social circles; navy bottom bar with © line, legal links and the prototype disclaimer.
- **Forms**: `.field-label`, `.field-select`, `.field-input` — 48 px height, 16 px text (prevents iOS zoom), visible focus ring `brand-500`.
- **Option cards** (quote wizard): radio/checkbox visually replaced by cards; native input kept (`sr-only`) for keyboard and screen readers. 2 px border, 48 px icon tile (`bg-wash` → solid `brand-600` when checked), Prompt label + hint. Mobile: horizontal row with the indicator at the end; `sm`+: vertical card, indicator top-right, ExplainButton beside it (outside the `<label>`). Icons per usage/priority are mapped in `QuoteWizard.tsx` (`usageIcon`, `priorityIcon`).
- **Inner-page hero** (`components/ui/PageHero.tsx`): `wash → canvas` gradient band, optional back link, eyebrow (short English), Prompt H1 30 / 40 px, body 17–18 px. Used by Lab, Lab article, My Garage, claims, car-model pages and legal pages. Journey pages (results, compare, plan, advisor) use the same wash band inline.
- **Journey steps** (`JourneySteps`): numbered circles joined by lines that fill blue as steps complete; labels from `md`; below `sm` a "label · ขั้นที่ n จาก 5" line (decorative, `aria-hidden`; the list keeps `aria-current="step"`).
- **My Car chip**: `brand-50` rounded-2xl chip with car icon tile, "My Car" micro-label, vehicle + estimated value and a "เปลี่ยนรถ" link (≥ 44 px). Shown on wizard steps 2–3.
- **Sticky action bar**: wizard actions stick to the bottom of the viewport on mobile (white/95 + blur, safe-area padding; back button icon-only with sr-only text) and sit as a normal card footer from `sm`. The results compare bar floats as a rounded-2xl `shadow-float` panel inset 8–16 px from the viewport edge.
- **Plan card** (`InsuranceCard`): rounded-xl2; insurer mark + insurer/product name + type chip; premium in a `wash` panel (Prompt 32 px); four key rows at ≥ 44 px (booleans show the CoverMark next to the text); match badge + list in an outlined panel; source badge; primary "เลือกแพ็กเกจ" + secondary "ดูรายละเอียด" (rounded-xl) and the compare toggle (dashed outline → brand-50 when selected). The recommended card gets a blue ring and a "แนะนำสำหรับคุณ" pill on its top edge.
- **Highlight panels** ("แนะนำสำหรับคุณ", "ต่างกันตรงไหน?", advisor context): rounded-xl2, `brand-100` border, `brand-50 → white` diagonal wash, white inner panels. Closing CTAs on inner pages use a `brand-50 → wash` horizontal wash instead of the old navy card.
- **Contact buttons** (`components/contact/ContactButtons.tsx`, LINE-first launch): `LineButton` solid `line-600` with a green-tinted lift shadow; `CallButton` `outline` / `solid` / `onDark`. Rounded-xl, sizes `sm` and `md` 44 px, `lg` 48–56 px. LINE is always the first and widest action.
- **Mobile contact bar** (`MobileContactBar`): below `sm`, fixed bottom panel with rounded top corners and an upward shadow; LINE and call at 1.4 : 1. Hidden on `/quote*`.
- **Price on request** (`PriceOnRequest`): replaces the premium while `SHOW_PRICES` is off. `line-100` border, `line-50 → white` wash, white icon tile with a tag icon, "สอบถามราคาจริง" in Prompt, full-width LINE button.
- **LINE quote band** (`LineQuoteBand`, homepage): the one dark band besides the footer bar (navy → brand gradient with two blurred glows). Three steps joined by a connector (vertical on phones, horizontal from `sm`); step 1 is filled `line-600`. Buttons are full width below 420 px. QR card (desktop only) with a `line-50` LINE ID chip.
- **Desktop QR** on the advisor page: `lg` only, inside the contact card, `line-50` panel. Phones use the buttons instead.
- **Cards**: `.card` — white, 1 px `navy-100` border, `shadow-card`.
- **Tables**: horizontal scroll inside the card on mobile; sticky first column; `wash` header and group rows; boolean rows use CoverMark (compare table, Lab type matrix, plan detail); differing rows marked with a blue dot; best value in `success-700`.
- **Explain button**: ⓘ icon (or icon + "อธิบายให้เข้าใจง่าย"), opens native `<dialog>`.
- **Source badge**: mock (amber), pending (grey), verified (green).

## Icons

lucide-react, outlined. UI icons 16–24 px; homepage feature/section icons 36–44 px at stroke 1.5 in `brand-600` without tiles (mockup). One icon per idea; no decorative icon clusters.

## Imagery

Photo slots are defined once in `components/brand/Photo.tsx` (`photos` map + `<Photo slot="…">`). Files live in `public/images/`:

| Slot | File | Target photo |
| --- | --- | --- |
| hero | `hero-suv.webp` 1400×1000 | Silver compact SUV, front three-quarter, clean road, soft blue sky, blurred modern skyline, empty space left. Shown inside a large elliptical sky arc on the right that bleeds to the page edge and fades out at the bottom |
| lifestyle | `lifestyle-driver.webp` 1200×771 | Smiling young Thai woman at the driver window, daylight. Fades into the `wash` panel on its right |
| advisor | `advisor.webp` 640×800 | Smiling Thai female advisor, headset, navy polo, plain light or transparent background; overlaps the advisor panel's top edge |
| articleFlood / articleEv / articleSteering | `article-*.webp` 480×320 | Flooded street with cars / EV charging plug / hands on a steering wheel |

The shipped files are original placeholder illustrations. Original photos for every slot were generated in Canva (media ids in `photos`) but could not be downloaded from the build environment; export them from Canva, compress to ≤ 250 KB `.webp`, and overwrite the files with the same names. Images are served pre-sized with `unoptimized` (no image optimiser binding on Workers); only the hero uses `priority`. Never use real insurer logos, car brand badges or readable number plates. Partner tiles stay neutral placeholders until logos are authorised.

## Honesty in layout

The mockup's testimonial carousel is replaced by "สิ่งที่เราสัญญา" (three commitments, icon medallions instead of avatars). No reviews, star ratings, customer counts, satisfaction percentages, or "0%" instalment claims until they are real and approved.

## Accessibility

Skip link, landmark labels, `aria-current` on nav/steps, labelled form controls, error messages linked by `aria-describedby`, `aria-live` for result counts and simulator output, `prefers-reduced-motion` respected.
