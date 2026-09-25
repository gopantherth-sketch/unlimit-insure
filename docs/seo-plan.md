# Unlimit Insure — SEO Plan (draft)

Page titles and descriptions live in `content/seo.ts`. Copy rules follow `docs/content-style-guide.md`. Status: DRAFT, needs compliance review (PROJECT_MASTER §32) before any page publishes.

## Keyword clusters

| Cluster | Example Thai queries | Where it lands |
|---|---|---|
| By type | ประกันรถยนต์ชั้น 1, ประกันชั้น 2+, ประกันชั้น 3+, ประกันชั้น 3, ประกันชั้น 1 กับ 2+ ต่างกันอย่างไร | `/`, `/lab/type1-vs-2plus`, `/quote` |
| Compare / price | เปรียบเทียบประกันรถ, เช็กเบี้ยประกันรถยนต์, เบี้ยประกันรถยนต์, ต่อประกันรถยนต์ | `/compare`, `/quote`, `/garage` (renewal) |
| By car model | ประกันรถ Toyota Corolla Cross, ประกันชั้น 1 Honda City, ประกัน [ยี่ห้อ] [รุ่น] [ปี] | future model pages |
| EV | ประกันรถยนต์ไฟฟ้า, ประกันรถ EV, ประกันแบตเตอรี่รถ EV, ประกันเครื่องชาร์จ | `/lab/ev-insurance`, future EV model pages |
| Topic | ซ่อมห้างหรือซ่อมอู่, ค่าเสียหายส่วนแรก คืออะไร, ประกันรถน้ำท่วม, ทุนประกัน คืออะไร, พ.ร.บ. กับประกันภาคสมัครใจ | `/lab/*` articles, glossary |

Rule: one primary cluster per page. Do not target the same query with two pages.

## Future URL patterns

- Model pages: `/insurance/{brand}/{model}` e.g. `/insurance/toyota/corolla-cross`. Optional year: `/insurance/toyota/corolla-cross/2024` only when content differs by year.
- EV hub: `/insurance/ev` listing EV model pages; EV model pages use the same `/insurance/{brand}/{model}` pattern.
- Type pages: `/insurance/type-1`, `/insurance/type-2-plus`, `/insurance/type-3-plus`, `/insurance/type-3`.
- Lab articles: `/lab/{topic-slug}` (existing pattern, e.g. `/lab/what-is-excess`). Slugs are short English kebab-case.
- Lab topic hubs (later, when there are enough articles): `/lab/topic/{coverage|repair|claims|ev|renewal}`.
- Slugs lower-case ASCII, no dates, no insurer names.

Model pages only go live when there is real content for that model: which coverages matter, typical trade-offs, and a prefilled entry into the quote journey. No thin pages generated from a template with only the name swapped.

## Internal linking rules

1. Every Lab article and model page links into the quote journey (`/quote`, prefilled with the model when possible). This is the article's last section, per the style guide.
2. Every glossary term used on a page links to its Explain entry or the relevant Lab article.
3. Model pages link to the type pages and to the Lab articles that matter for that car (e.g. EV models link to `/lab/ev-insurance`).
4. Lab articles link to 1–3 related articles, not more.
5. `/quote/results` and `/compare` link to Lab articles for the terms users hesitate on (excess, dealer vs garage).
6. Footer links `/privacy` and `/terms` on every page.
7. Anchor text describes the destination in Thai ("ดูว่าประกันชั้น 1 กับ 2+ ต่างกันอย่างไร"), never "คลิกที่นี่".

## Indexing notes

- `/quote/results`, `/compare` and `/garage` depend on user state in the URL or browser. Consider `noindex` for parameterised URLs, keep the bare route indexable, and set canonical to the bare route.
- Vehicle data in query strings must never appear in sitemap or canonical URLs.

## What must not be claimed

- Superlatives: ถูกที่สุด, ดีที่สุด, อันดับ 1, คุ้มที่สุด, หรือ "ที่สุด" ใด ๆ — in titles, descriptions and headings too.
- Statistics, customer counts, ratings, reviews or testimonials.
- Real premiums, limits, statutory amounts (e.g. พ.ร.บ.) or excess amounts in static copy or meta.
- Claim promises: เคลมผ่านแน่นอน, อนุมัติทันที, จ่ายเร็วใน X วัน.
- Real insurer names or logos in meta or page copy until partnerships and approved materials are confirmed.
- Licence, broker status or company facts that are not confirmed (use placeholders until verified).
- "Free" or "no cost" claims, discounts or promotions, unless approved and time-bound via the compliance workflow.
- Urgency: วันนี้วันสุดท้าย, รีบเลย, เหลือเวลา.
