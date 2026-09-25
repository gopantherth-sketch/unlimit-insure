# Design System

Blue/white fintech direction (PROJECT_MASTER.md §6, §37). Tokens live in `tailwind.config.ts`; component classes in `app/globals.css`.

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
| `success-*` | `#12805C` | Covered / best value |
| `warning-*` | `#B45309` | Excess, mock-data labels, renewal due |
| `danger-600` | `#C0263A` | Errors, not covered (sparingly) |

Gradients: only soft `brand-50 → white` washes and one full-bleed brand band (lifestyle banner). No stacked gradients.

## Typography

IBM Plex Sans Thai (400/500/600/700), Thai + Latin.

| Role | Size |
| --- | --- |
| Hero H1 | 34 / 48 / 56 px (mobile / sm / lg), bold, 1.2 line-height |
| Section H2 (`.h-section`) | 24 / 30 px bold |
| Card title | 18 px bold |
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

- **Buttons** (`components/ui/button.ts`): `primary` (solid blue), `secondary` (outlined), `ghost`, `white` (on blue/navy). Sizes `sm` 36 px, `md` 44 px, `lg` 48–56 px. Tap targets ≥ 44 px on mobile.
- **Forms**: `.field-label`, `.field-select`, `.field-input` — 48 px height, 16 px text (prevents iOS zoom), visible focus ring `brand-500`.
- **Option cards**: radio/checkbox visually replaced by cards; native input kept (`sr-only`) for keyboard and screen readers.
- **Cards**: `.card` — white, 1 px `navy-100` border, `shadow-card`.
- **Tables**: horizontal scroll inside the card on mobile; sticky first column; group header rows; differing rows marked with a blue dot; best value in `success-700`.
- **Explain button**: ⓘ icon (or icon + "อธิบายให้เข้าใจง่าย"), opens native `<dialog>`.
- **Source badge**: mock (amber), pending (grey), verified (green).

## Icons

lucide-react, outlined, 16–24 px, `brand-600` on `brand-50` tiles. One icon per idea; no decorative icon clusters.

## Imagery

Hero and lifestyle band currently use an SVG illustration and a brand band. Replace with licensed photography (car in city, real Thai drivers) at the marked slots: `components/home/HeroVisual.tsx`, `components/home/LifestyleBanner.tsx`. Do not use real insurer logos without authorisation.

## Accessibility

Skip link, landmark labels, `aria-current` on nav/steps, labelled form controls, error messages linked by `aria-describedby`, `aria-live` for result counts and simulator output, `prefers-reduced-motion` respected.
