# Unlimit Insure — Project Master / Codex Handoff

**Project:** Unlimit Insure  
**Primary product:** Auto insurance sales funnel + customer insurance platform  
**Working folder on user's PC:** `D:\Unlimit Insure`  
**Current design direction:** Modern blue/white, clean fintech / insurance UI based on the Unlimit Insure logo  
**Status:** Product strategy, UX architecture, competitive review, and MVP direction defined. Ready to move into Codex for implementation planning and production prototyping.

---

# 1. Project Goal

Build a modern auto-insurance website that does more than act as a quotation form or brochure.

The platform should help users:

1. Understand insurance before choosing.
2. Compare packages clearly.
3. See why plans differ, not only which is cheapest.
4. Explore available packages with minimal pressure.
5. Purchase insurance online when supported.
6. Manage policies after purchase.
7. Receive claims / after-sales guidance.
8. Compare renewal options later.

The product should feel like a **digital insurance advisor / car-protection platform**, not a traditional broker website.

Core idea:

> **Understand → Compare → Decide → Stay Protected**

---

# 2. Brand / Positioning Direction

## Recommended positioning

Avoid positioning Unlimit Insure only as:

- “เว็บเปรียบเทียบประกัน”
- “ประกันราคาถูก”
- “เปรียบเทียบหลายบริษัท”
- “เช็กเบี้ยเร็ว”

Those are table stakes in the Thai market.

Recommended brand territory:

> **ประกันรถ ที่เข้าใจก่อนเลือก**

Alternative language:

> **ประกันรถที่เข้าใจคุณ มากกว่าแค่ราคา**

Possible supporting English line:

> **Insurance for Your Car. Explained.**

or

> **Compare clearly. Choose confidently. Stay protected.**

Long-term brand values:

- Clarity
- Personalization
- Transparency
- Convenience
- Human support
- Ongoing service after purchase

---

# 3. Competitor / Market Research Summary

Research compared well-known international and Thai insurance platforms.

## International references

### The Zebra
Useful ideas:
- Multi-insurer comparison
- Quote comparison
- Human advisor support
- Rate / renewal monitoring concepts
- Continued relationship after initial quote

Reference:
https://www.thezebra.com/

### Policygenius
Useful ideas:
- Content + education + comparison in one ecosystem
- Expert guidance
- Strong educational content supporting purchase decisions

Reference:
https://www.policygenius.com/auto-insurance/

---

## Thailand references

### Roojai
Strengths:
- Strong digital quote → customize coverage → buy flow
- Vehicle / driver information flow
- e-policy
- Post-sale mobile experience
- Claims and assistance
- Repair centre / roadside support concepts

Reference:
https://www.roojai.com/car-insurance/

### heygoody
Strengths:
- Very strong low-pressure proposition
- Lets users see prices without immediately giving personal information
- Self-service online purchase
- Multiple insurers
- No need to wait for a sales call

Reference:
https://www.heygoody.com/th/home  
https://www.heygoody.com/checkinsurance

Important principle to adopt:

> **Explore First. Identify Later.**

### Rabbit Care
Strengths:
- Marketplace model
- Compare multiple insurers
- Price + coverage comparison
- Human support / Care Center
- Vehicle-model-based content / quote pages

Reference:
https://rabbitcare.com/motor-insurances

### CheckDi
Strengths:
- Broad marketplace
- Multiple insurance categories
- Large comparison inventory
- Fast quote positioning

Reference:
https://checkdi.com/th/car/main

---

# 4. Strategic Differentiation

Most competitors optimize around:

> Search → Price → Buy

Unlimit should optimize around:

> **Understand → Compare → Decide → Stay Protected**

The product should not simply list policies.

It should explain:

- Why one package costs more
- What the user gains or gives up
- What coverage means in real-life situations
- Which policy requirements align with the user's priorities
- What happens after purchase

---

# 5. Signature Product Experiences

The project should be built around four signature experiences.

## 5.1 My Car

Start with the user's vehicle, not insurance jargon.

Example:

```text
What do you drive?

Toyota
Corolla Cross
2025

[ เช็กประกันสำหรับรถคันนี้ → ]
```

Before purchase, call this concept **My Car**.

After purchase, it evolves into **My Garage**.

---

## 5.2 Smart Compare

Do not only compare premium.

Explain why plans differ.

Example:

```text
                PLAN A       PLAN B       PLAN C

Premium         15,900       14,800       17,200
Sum insured     900K         850K         950K
Repair          Dealer       Garage       Dealer
Flood           Yes          Yes          Yes
Excess          0            2,000        0
Needs matched   5/6          3/6          6/6
```

Then explain:

### Why is Plan B cheaper?

- Garage repair instead of dealer repair
- 2,000 THB excess
- 50,000 THB lower sum insured

This is a key differentiator.

---

## 5.3 Explain / Simulate

Every complex insurance field should support:

> **ⓘ อธิบายให้เข้าใจง่าย**

Examples:
- Sum insured
- Excess / deductible
- Dealer repair
- Garage repair
- Third-party liability
- Personal accident
- Medical expenses
- Bail bond

Add real-world scenario examples.

---

## 5.4 My Garage

After purchase, My Garage becomes the customer ownership hub.

Example:

```text
Toyota Corolla Cross
กข 1234

Insurance
ACTIVE

Renewal
142 days

[ ดูความคุ้มครอง ]
[ กรมธรรม์ ]
[ ขอความช่วยเหลือ ]
[ ขั้นตอนเคลม ]
[ ต่อประกัน ]
```

Important:
My Garage must be more than document storage.

It should provide:
- Policy overview
- Coverage explanation
- Claims guidance
- Policy documents
- Renewal status
- Advisor support
- Vehicle history within Unlimit

---

# 6. Homepage Design Direction

## Visual direction

The user selected the **blue/white concept**.

The website should use:

- White / off-white background
- Bright royal / electric blue accent
- Dark navy typography
- Soft blue gradients
- Rounded cards
- Restrained shadows
- Large clean typography
- Plenty of whitespace
- Modern fintech / insuretech aesthetic
- Automotive imagery integrated into sections
- Mobile-first responsive design

The site must feel:
- Trustworthy
- Modern
- Easy
- Friendly
- Clear
- Not overly corporate
- Not cluttered

Avoid:
- Generic stock-heavy insurance aesthetic
- Too many blue gradients
- Excessive icons
- Traditional insurance-company visual density
- “cheap insurance” look
- Overuse of car accessories / speedometer / tire motifs

The logo communicates:
- Care
- People
- Protection

The UI should add:
- Cars
- Digital tools
- Comparison
- Modern technology

---

# 7. Homepage Architecture — Revised

Recommended homepage:

```text
HEADER

↓

HERO
"ประกันรถที่เข้าใจคุณ
มากกว่าแค่ราคา"

[ ADD YOUR CAR ]

✓ ยังไม่ต้องให้เบอร์
✓ ดูราคาและความคุ้มครองก่อน

↓

TRUST / CREDENTIALS
Insurance Partners / License / Secure

↓

HOW UNLIMIT WORKS

YOUR CAR
    ↓
YOUR NEEDS
    ↓
COMPARE
    ↓
UNDERSTAND
    ↓
CHOOSE

↓

WHY UNLIMIT

Compare clearly
Understand coverage
Support after purchase

↓

SMART COMPARE DEMO

"ต่างกันตรงไหน?"

↓

REAL-LIFE COVERAGE

"ถ้าเกิดแบบนี้ล่ะ?"

↓

INSURANCE LAB

↓

AFTER YOU BUY

My Garage
Claims
Renewal

↓

CUSTOMER REVIEWS

↓

ADVISOR CTA

↓

FOOTER
```

---

# 8. Hero Section

Recommended copy direction:

## Main headline

> **ประกันรถที่เข้าใจคุณ  
> มากกว่าแค่ราคา**

Supporting copy:

> เลือกความคุ้มครองที่ใช่ เปรียบเทียบง่าย  
> และเข้าใจสิ่งที่คุณกำลังซื้อก่อนตัดสินใจ

Primary CTA:

> **เพิ่มรถของคุณ**

or

> **เช็กประกันสำหรับรถคันนี้**

Supporting trust points:

- ยังไม่ต้องให้เบอร์โทร
- เปรียบเทียบหลายบริษัท
- มีที่ปรึกษาช่วยดูแล
- ดูความคุ้มครองก่อนตัดสินใจ

---

# 9. Anonymous Exploration Principle

This is a core UX principle.

Do not force personal information too early.

## Phase A — Anonymous

User can:

```text
Add car
→ Explore
→ Understand coverage
→ See packages
→ Compare
```

No required:
- Phone
- LINE
- Email
- Name

## Phase B — Ask only when needed

Ask for personal details when the user wants to:

- Save quote
- Request exact quote
- Talk to advisor
- Purchase
- Save vehicle / policy

Core product rule:

> **Value before lead capture.**

---

# 10. Quote / Insurance Match Journey

Do not begin with:

- ชั้น 1
- 2+
- 3+

Instead begin from usage and priorities.

Recommended flow:

```text
YOUR CAR
   ↓
YOUR USE
   ↓
WHAT MATTERS
   ↓
YOUR OPTIONS
   ↓
COMPARE
   ↓
SELECT
```

## Your Use

Example:

```text
รถคันนี้ใช้แบบไหน?

● ขับไปทำงานทุกวัน
○ ใช้เฉพาะวันหยุด
○ วิ่งต่างจังหวัดบ่อย
○ รถคันที่สอง
○ รถครอบครัว
```

## What Matters

Example:

```text
□ ซ่อมศูนย์
□ ค่าเบี้ยประหยัด
□ ไม่มีค่าเสียหายส่วนแรก
□ น้ำท่วม
□ รถใช้ระหว่างซ่อม
□ ความคุ้มครองสูง
□ Roadside Assistance
□ EV Battery
```

---

# 11. Insurance Match Logic

Avoid meaningless AI percentages such as:

> 93% match

unless a real, defensible scoring system exists.

Use transparent logic instead:

> **ตรงกับสิ่งที่คุณต้องการ 5 จาก 6 ข้อ**

Example:

```text
YOUR PRIORITIES

✓ ซ่อมศูนย์
✓ น้ำท่วม
✓ ไม่มี Excess
✓ ทุนประกันสูง
✓ Roadside Assistance
✕ รถใช้ระหว่างซ่อม
```

Then provide:

> **ทำไมเราจึงแนะนำแพ็กเกจนี้?**

The user must be able to understand the recommendation.

---

# 12. Package Result Page

This is one of the most important screens.

Example card:

```text
INSURER

ประกันชั้น 1

Toyota Corolla Cross 2025

Premium
15,490 THB / year

Sum insured
900,000 THB

Repair
Dealer

Flood
Covered

Excess
0

Matches your needs
5 / 6

[ ดูรายละเอียด ]
[ เปรียบเทียบ ]
[ เลือกแพ็กเกจ ]
```

Recommended filters:
- Recommended / relevant
- Lowest premium
- Dealer repair
- Garage repair
- No excess
- Flood
- EV
- Sum insured range

Avoid flooding the user with 20 undifferentiated cards.

---

# 13. Smart Comparison

Comparison should answer:

> **What's different?**

Not simply show a spreadsheet.

Recommended comparison fields:

- Premium
- Sum insured
- Repair type
- Flood
- Theft / fire
- Excess / deductible
- Third-party liability
- Personal accident
- Medical expense
- Bail bond
- Roadside assistance
- Replacement car
- EV-specific protection
- Customer-needs matched

After the table, generate a difference summary.

Example:

```text
Plan B is 1,100 THB cheaper than Plan A.

But:

- Garage repair instead of dealer
- 2,000 THB excess
- 50,000 THB lower sum insured
```

This is a signature Unlimit experience.

---

# 14. Coverage Simulator

Working concept:

> **เกิดแบบนี้ ประกันของฉันคุ้มครองไหม?**

Scenarios:

```text
💥 ชนรถ
🧱 ชนไม่มีคู่กรณี
🌊 น้ำท่วม
🔥 ไฟไหม้
🚗 รถหาย
🪟 กระจกแตก
🔋 EV Battery damage
```

Result example:

```text
Plan A

Scenario:
น้ำท่วม

✓ อยู่ในความคุ้มครอง

Maximum:
850,000 THB

Important:
Conditions and exclusions apply.

[ ดูเงื่อนไขกรมธรรม์ ]
```

Important rule:

**Coverage Simulator results must come from verified product / policy rules.**

Do not rely on generative AI guesses.

---

# 15. Insurance Lab

Do not build a normal “blog” as the primary educational experience.

Build an interactive education hub:

```text
INSURANCE LAB

ชั้น 1 vs 2+
[ Compare ]

ซ่อมห้าง vs ซ่อมอู่
[ See difference ]

Excess คืออะไร?
[ Try example ]

รถน้ำท่วม
[ Simulate ]

EV Insurance
[ Explore coverage ]
```

Traditional SEO articles can sit underneath these tools.

Every content page should connect back into a quote / comparison journey.

Example:

```text
Article:
ชั้น 1 vs 2+

↓ personalized CTA

สำหรับ Toyota Corolla Cross 2025 ของคุณ

Type 1     Type 2+
15,400     8,900

[ Compare Coverage ]
```

---

# 16. Package Detail Page

Each plan should have a real product-detail page, not just a PDF.

Recommended sections:

1. Insurer
2. Product / package name
3. Premium
4. Monthly option if supported
5. Sum insured
6. Repair type
7. Major coverage
8. Third-party liability
9. PA
10. Medical
11. Bail bond
12. Deductible / excess
13. Special benefits
14. “เหมาะกับใคร”
15. Explain-this controls
16. Source / last verified
17. Terms / policy wording
18. CTA:
   - Buy
   - Compare
   - Talk to advisor

---

# 17. Purchase Flow

Recommended:

```text
SELECT PACKAGE
↓
CUSTOMER DETAILS
↓
VEHICLE DETAILS
↓
UPLOAD DOCUMENTS
↓
REVIEW
↓
PAYMENT
↓
INSURER SUBMISSION
↓
APPROVAL
↓
POLICY ISSUED
```

Possible required uploads:
- Vehicle registration
- Driving license
- Customer identification
- Vehicle photos if required
- Other insurer-required documents

Each part must clearly distinguish:

- Unlimit-controlled step
- Insurer-controlled step
- Manual step
- Automated step

---

# 18. Purchase Status Timeline

Example:

```text
✓ Payment received
● Document verification
○ Insurer approval
○ Policy issuance
○ Policy ready
```

Users should understand exactly where their application is.

---

# 19. My Garage

After purchase:

```text
MY GARAGE

Toyota Corolla Cross
กข 1234

Insurance
ACTIVE

Coverage until
24 Sep 2027

Quick Actions

[ Policy ]
[ Coverage ]
[ Claim help ]
[ Documents ]
[ Renewal ]
[ Advisor ]
```

Future multi-vehicle example:

```text
Toyota Corolla Cross
Protected ✓

Honda City
Renewal in 32 days ⚠

BYD Sealion 6
No policy connected
```

---

# 20. Insurance Health

Long-term idea:

```text
INSURANCE HEALTH

Protection
82 / 100

✓ Collision
✓ Theft
✓ Flood
✓ Dealer repair

⚠ Policy expires in 42 days
⚠ Vehicle value may have changed
```

Do not ship an arbitrary score unless it has a transparent calculation.

This could be implemented initially as:
- Complete
- Needs attention
- Renewal due
- Missing data

instead of a numeric score.

---

# 21. Renewal Intelligence

Renewal should be its own product experience.

Example:

```text
Toyota Corolla Cross

Policy expires
24 Sep 2027

CURRENT POLICY

Premium last year
16,400

Renewal offer
15,900

Alternative
14,600

Saving
1,300

BUT

Alternative changes:
- Dealer → Garage
- Sum insured -50K

[ Compare Renewal ]
```

Core Unlimit principle:

> **Don't only show what is cheaper. Show what changed.**

---

# 22. Advisor Handoff

When user clicks:

> **ปรึกษาผู้เชี่ยวชาญ**

The advisor should receive context.

Example:

```text
CUSTOMER JOURNEY

Vehicle:
Toyota Corolla Cross 2025

Interested:
Type 1

Priorities:
- Dealer repair
- Flood
- No excess

Viewed:
6 plans

Compared:
A / B / C

Current plan:
Plan A

Question:
"ถ้าชนไม่มีคู่กรณีต้องจ่ายไหม?"
```

The advisor should not ask the customer to repeat information already provided.

---

# 23. Post-Sale Positioning

A major potential differentiator:

> **ก่อนซื้อเราอธิบาย หลังซื้อเรายังดูแล**

Unlimit should clearly show:

```text
BEFORE BUYING

Compare
Understand
Advisor

↓ AFTER BUYING

Policy
Claims guidance
Documents
Renewal
Advisor
```

---

# 24. Customer Account

Potential customer dashboard:

```text
Hello, [Name]

YOUR CAR

Toyota Corolla Cross

Policy
Type 1

Status
Active

Days remaining
364

Quick Actions

- View policy
- Download documents
- Claim guide
- Call insurer
- Contact advisor
- Renew
```

---

# 25. Back Office / CRM

Back office is essential.

Suggested modules:

```text
DASHBOARD

LEADS
CUSTOMERS
VEHICLES
QUOTES
INSURERS
PRODUCTS
POLICIES
PAYMENTS
DOCUMENTS
RENEWALS
CLAIMS SUPPORT
CONTENT
ANALYTICS
```

Example dashboard:

```text
Leads              128
Quotes              74
Pending             21
Purchased           31
Renewals             9

Conversion          24.2%

Premium sold        ฿486,200
```

Example sales pipeline:

```text
NEW LEAD
↓
VEHICLE INFO
↓
QUOTED
↓
COMPARING
↓
DOCUMENTS
↓
PAYMENT
↓
POLICY ISSUED
↓
RENEWAL
```

---

# 26. Back Office Customer Profile

Suggested:

```text
CUSTOMER

Name
Phone
LINE
Email

VEHICLE
Brand
Model
Sub-model
Year
Registration

INTEREST
Insurance type
Repair preference
Budget
Coverage priorities

ACTIVITY
Quotes sent
Plans viewed
Plans compared
Advisor conversations
Last activity
Next action
```

---

# 27. Insurance Product Data Model

Do NOT model insurance only as:

```text
Package
Price
Coverage
```

Insurance changes over time and must be auditable.

Recommended model:

```text
INSURER

PRODUCT

PRODUCT VERSION
- Effective from
- Effective until

VEHICLE ELIGIBILITY

RATE / QUOTE

COVERAGE

COVERAGE LIMIT

CONDITION

EXCLUSION

DEDUCTIBLE

REPAIR TYPE

BENEFIT

SOURCE DOCUMENT

SOURCE VERSION

LAST VERIFIED

QUOTE

QUOTE SNAPSHOT
```

---

# 28. Quote Snapshot Requirement

Very important.

If a customer buys based on:

```text
Premium      15,490
Sum insured  850,000
Repair       Dealer
```

and the insurer changes the product later, the customer's old quote must remain unchanged.

Store a full quote snapshot at the time of issue / purchase.

Recommended snapshot fields:

- Product version
- Premium
- Sum insured
- Repair
- Coverage
- Limits
- Deductibles
- Benefits
- Product source version
- Timestamp
- Advisor / system source

---

# 29. Verified Source System

Every plan should be traceable to a verified source.

Customer-facing concept:

```text
Verified

Source:
Insurer product document

Updated:
18 Sep 2026

Effective:
1 Sep – 31 Dec 2026
```

Back office:

```text
Coverage data

SOURCE
Insurer_Product_2026_Q4.pdf

PAGE
7

VERIFIED BY
Admin

DATE
18 Sep 2026
```

This is important for:
- Coverage Simulator
- Explain This
- Product comparison
- Compliance
- Audit trail

---

# 30. Data Required From User

Before full implementation, collect these.

## Business / brand

- Business / agency name
- Logo
- Brand colors
- Phone
- LINE
- Facebook
- Website
- Company / broker / agent status
- License / registration information
- Insurers authorized to sell
- Key value proposition
- Current sales channels

## Insurance products

For each plan:

```text
Insurer
Product
Package
Vehicle
Premium
Sum insured
Repair
Coverage
Third-party liability
PA
Medical
Bail bond
Deductible
Benefits
Terms
Policy document
Source
```

## Current quote process

Need to know whether rates come from:

- Fixed tables
- Excel
- Insurer systems
- Broker platform
- API
- Manual request
- Combination

## Current sales process

Example:

```text
Facebook Ad
↓
Messenger
↓
Ask vehicle
↓
Ask current insurance
↓
Ask expiry
↓
Send quote
↓
Follow up
↓
Customer chooses
↓
Documents
↓
Payment
↓
Policy
```

## Real conversations

Useful anonymized samples:
- Easy sale
- Price shopper
- Coverage confusion
- Discount request
- Ghosting / no response
- Renewal
- EV customer
- Purchase
- Lost sale

## Vehicle data

Need:

```text
Brand
Model
Generation
Sub-model
Year
Engine
Fuel type
EV / HEV / PHEV / ICE
Estimated value
```

## Insurer information

- Insurer
- Logo
- Products
- Repair network
- Claims contacts
- Emergency contacts
- Roadside assistance
- Claims process
- Benefits
- Policy wording

## Commercial rules — back office only

- Premium
- Commission
- Campaign incentive
- Discount allowance
- Promotion
- Payment terms
- Salesperson commission
- Renewal commission

Customer recommendations must remain transparent and should not secretly rank plans only by commission.

## Existing documents

Collect:
- Quotations
- Product brochures
- Coverage tables
- Policy wording
- Sales presentations
- Customer application forms
- Payment instructions
- Renewal notices
- Claim guides
- Excel price tables
- Promotion sheets
- Insurer PDFs

## Existing content

Collect:
- Facebook posts
- TikTok scripts
- Articles
- FAQs
- LINE responses
- Sales scripts
- Videos
- Images
- Ads

## Purchase workflow

Need exact sequence and which steps are:
- Manual
- Automated
- Insurer-controlled

## Payment

Need:
- QR PromptPay
- Bank transfer
- Card
- Installments
- Payment link
- Insurer direct payment

Also identify:
- Who receives customer money
- Who issues receipt
- Who reconciles payment

## Renewal

Map:
- 60 days before expiry
- 30 days
- 15 days
- 7 days
- Expiry

## Claims / after-sales

Need to define:
- Customer contacts insurer directly?
- Customer contacts Unlimit?
- Unlimit coordinates claim?
- What support is promised?

---

# 31. Privacy / Data Architecture

Map:

```text
What data is collected
Why it is collected
When it is collected
Where it is stored
Who can access it
How long it is retained
Consent
Marketing consent
Deletion / request process
```

Personal data must not be collected earlier than necessary.

---

# 32. Compliance Considerations

This platform sells insurance in Thailand, so compliance should be part of system architecture.

Areas to validate with legal / compliance before launch:

- OIC rules for electronic insurance sales
- Broker / agent sales processes
- Use of insurer-approved advertising / solicitation materials
- Product information accuracy
- Personal data / PDPA
- Marketing consent
- Record retention
- Payment handling
- E-policy / document workflow
- Required disclosures
- Claim / advice wording

Recommended content workflow:

```text
DRAFT
↓
COMPLIANCE REVIEW
↓
APPROVED
↓
PUBLISHED
↓
EXPIRED
```

Do not allow unreviewed product claims / promotions to publish directly.

---

# 33. Recommended Technical Architecture

Exact stack can be finalized in Codex after reviewing real business data.

Current recommendation:

## Frontend / web app
- Next.js
- TypeScript
- Responsive / mobile-first
- Component-based architecture

## Database
- PostgreSQL

## Core entities
- Users
- Customers
- Vehicles
- Insurers
- Products
- Product versions
- Coverage
- Quotes
- Quote snapshots
- Policies
- Documents
- Payments
- Renewals
- Leads
- Activities
- Advisors
- Content
- Verification sources

## Storage
Secure object storage for:
- ID documents
- Vehicle documents
- Policy PDFs
- Insurer brochures
- Source documents

## Authentication
Support:
- Phone OTP
- Email
- Potential LINE / Google login later

## APIs / integrations
Later:
- Insurer APIs
- Payment gateway
- Messaging / LINE
- Email
- CRM / analytics
- Vehicle data source

---

# 34. Production Component Structure

Recommended frontend component architecture:

```text
<Header />

<Hero>
  <HeroContent />
  <VehicleVisual />
</Hero>

<QuickQuote />

<TrustStrip />

<HowUnlimitWorks />

<WhyUnlimit />

<SmartCompareDemo />

<CoverageSimulatorDemo />

<InsuranceLab />

<AfterPurchase />

<Testimonials />

<AdvisorCTA />

<Footer />
```

Reusable product components:

```text
<VehicleSelector />
<PrioritySelector />
<InsuranceCard />
<CoverageRow />
<ExplainButton />
<CompareTable />
<DifferenceSummary />
<VerifiedSource />
<AdvisorHandoff />
<PolicyTimeline />
<RenewalComparison />
```

---

# 35. MVP Scope — Revised

Avoid trying to build the full platform at once.

## V1 — Core conversion experience

1. Production-quality blue/white homepage
2. Vehicle selection
3. Anonymous quote exploration
4. Product result cards
5. Smart Compare
6. Package detail
7. Explain This
8. Advisor handoff
9. Simple admin for products / quotes / leads
10. Insurance Lab basic content

Goal:

> Can Unlimit help a user understand and choose motor insurance better than current alternatives?

---

## V2

- Coverage Simulator
- Customer login
- My Garage
- Documents
- Policy status
- Purchase flow
- Payment integration if business process supports it

---

## V3

- Renewal Intelligence
- Claims support
- Policy Health
- Deeper advisor CRM
- Insurer / broker API integration
- Messaging automation

---

## V4

- Advanced personalization
- Multi-vehicle household
- Motorcycle
- Travel
- Health
- Broader insurance marketplace

---

# 36. Categories for Launch

Do not launch with every insurance category.

Recommended initial focus:

```text
Motor Insurance
EV Insurance
พ.ร.บ.
```

Future expansion:

```text
Motorcycle
Travel
Health
Other insurance
```

Unlimit should become excellent at motor insurance first.

---

# 37. Design System Direction

## Color

Primary:
- Electric / royal blue matching logo

Supporting:
- White
- Off-white
- Soft blue
- Dark navy
- Neutral grey

Avoid excessive gradients.

## Shapes
- Rounded 12–24px cards
- Soft corners
- Minimal borders
- Light shadows

## Typography
- Large confident headlines
- Thai-first readability
- Clear body hierarchy
- Avoid overly small insurance detail text

## Icons
- Clean outlined / soft-rounded
- Use consistently
- Avoid cartoon-heavy iconography

## Automotive visual language
- High-quality car photography
- Vehicle profile cards
- Road / motion cues used sparingly
- Technical but approachable interface

---

# 38. Selected Mock Direction

The user explicitly preferred the **blue/white visual mock**.

Important implementation instruction:

> Treat the blue/white mock as the visual design target, but redesign the actual production homepage around the revised product architecture in this document.

Do not simply reproduce a generic insurance broker homepage.

The next design should visually preserve:
- Blue / white identity
- Large hero
- Clean quote box
- Rounded cards
- Partner logos
- Lifestyle / car visuals
- Strong typography

But UX should center on:
- My Car
- Smart Compare
- Explain
- Coverage scenarios
- After-sales care

---

# 39. Current Logo

Existing Unlimit Insure logo was provided during the project.

Design interpretation:
- Human / care / protection-oriented symbol
- Blue identity
- Friendly, trustworthy

Do not redesign without a specific reason.

Use the website's automotive visual system to add:
- Vehicle identity
- Technology
- Comparison
- Digital experience

---

# 40. Content Tone

Customer-facing content should be:

- Easy to understand
- Professional
- Helpful
- Non-pushy
- Clear
- Thai-first
- Minimal jargon
- Explain jargon when unavoidable

Avoid:
- Fear-based insurance selling
- Aggressive price claims
- Unsupported “best” claims
- Overloaded legal copy in primary UI
- Hard-sell call-center tone

---

# 41. Core Product Principles

1. **Value before lead capture**
2. **Explain before selling**
3. **Show trade-offs, not only price**
4. **Recommendations must be transparent**
5. **Coverage data must be verified**
6. **Quote history must be auditable**
7. **Post-sale service is part of the product**
8. **Mobile-first**
9. **Motor insurance first**
10. **Human advisor should receive digital context**
11. **Do not make users repeat information**
12. **Do not pretend AI certainty where rules are unclear**
13. **Every important product fact should point to a source**

---

# 42. Suggested Project Folder Structure

For `D:\Unlimit Insure`:

```text
D:\Unlimit Insure
│
├── README.md
├── PROJECT_MASTER.md
│
├── docs/
│   ├── product-vision.md
│   ├── site-architecture.md
│   ├── customer-journey.md
│   ├── sales-funnel.md
│   ├── competitor-research.md
│   ├── data-model.md
│   ├── compliance-notes.md
│   └── roadmap.md
│
├── data/
│   ├── insurers/
│   ├── insurance-products/
│   ├── vehicle-data/
│   ├── quotations/
│   ├── coverage-rules/
│   └── source-documents/
│
├── design/
│   ├── logo/
│   ├── design-system.md
│   ├── wireframes/
│   ├── ui-reference/
│   └── mockups/
│
├── app/
│   ├── public-site/
│   ├── quote-engine/
│   ├── compare/
│   ├── insurance-lab/
│   ├── my-garage/
│   └── checkout/
│
├── backoffice/
│   ├── crm/
│   ├── products/
│   ├── quotes/
│   ├── customers/
│   ├── policies/
│   ├── renewals/
│   └── analytics/
│
└── archive/
```

---

# 43. Codex Starting Tasks

Recommended order when opening this project in Codex.

## Task 1 — Inspect project files

- Read this `PROJECT_MASTER.md`
- Inventory all files in `D:\Unlimit Insure`
- Identify:
  - Logo
  - Product files
  - Quotations
  - Excel files
  - Brochures
  - Existing HTML / code
  - Design references

Do not modify business logic before inventory.

---

## Task 2 — Create project README

Create a concise `README.md` summarizing:

- Product vision
- Current status
- Folder structure
- How to run locally
- Architecture
- MVP scope
- Known missing data

---

## Task 3 — Build data inventory

Create:

```text
docs/data-inventory.md
```

List:
- Available data
- Source
- Format
- Quality
- Missing fields
- Suggested normalization

---

## Task 4 — Build design system

Create:

```text
design/design-system.md
```

Define:
- Colors
- Typography
- Spacing
- Radius
- Shadows
- Buttons
- Forms
- Cards
- Tables
- Icons
- Responsive breakpoints

Match the selected blue/white direction.

---

## Task 5 — Build homepage prototype

Build a production-quality responsive homepage.

Priority:
- Visual fidelity to the blue/white direction
- Revised homepage architecture
- Real logo
- Placeholder data only where actual data is missing
- No fake claims

---

## Task 6 — Build quote journey prototype

Implement:

```text
My Car
→ Usage
→ Priorities
→ Results
→ Compare
→ Package Detail
```

Use mock data initially.

---

## Task 7 — Define real database schema

Before connecting real insurance data, define:

- Product versioning
- Coverage rules
- Quote snapshots
- Verified source references
- Vehicle eligibility
- Customer / vehicle relationships

---

# 44. Acceptance Criteria for First Production Prototype

Homepage:
- Matches selected blue/white direction
- Responsive desktop + mobile
- Uses real logo
- Has clear primary CTA
- Does not force phone number immediately
- Explains Unlimit differentiation

Quote prototype:
- Vehicle selection works
- Priorities can be selected
- Results are generated from mock structured data
- Compare works
- Difference summary works
- Explain controls work
- Data source label exists

Code:
- Component-based
- Type-safe
- No giant monolithic page
- Accessible forms
- Reusable components
- No hard-coded duplicate package logic
- Clean project structure

---

# 45. Known Open Questions

Still need answers / real data for:

1. Exact legal / business entity
2. Broker / agent status
3. Insurance companies currently sold
4. Number of available products
5. Current quotation source
6. Rate source:
   - Excel?
   - Broker portal?
   - Insurer site?
   - API?
7. Current sales process
8. Payment process
9. Who receives payment
10. Policy issuance process
11. Current after-sales support
12. Claims involvement
13. Renewal workflow
14. Vehicle database source
15. Customer data currently collected
16. Actual insurer brochures / policy wording
17. Real quote examples
18. Commission / promotion structure
19. Required disclosures
20. Exact advisor workflow

---

# 46. Immediate User Inputs Needed

The highest-value next files to provide are:

1. 3–10 real insurance quotations
2. Excel / rate tables
3. Product brochures / PDFs
4. List of insurers
5. Current sales workflow
6. Example anonymized customer chats
7. Payment flow
8. Policy issuance flow
9. Existing social content / FAQ
10. Any current website / landing page

---

# 47. Final Product Definition

Unlimit Insure should not become another site whose only message is:

> “We compare many insurers and find cheap premiums.”

The intended product is:

> **A car insurance decision and ownership platform that helps users understand what they are buying, compare plans transparently, get human help when needed, and continue receiving service after purchase.**

Core journey:

```text
YOUR CAR
   ↓
YOUR NEEDS
   ↓
INSURANCE MATCH
   ↓
SMART COMPARE
   ↙       ↘
EXPLAIN   SIMULATE
   ↘       ↙
     SELECT
        ↓
       BUY
        ↓
   MY GARAGE
   ↙   │    ↘
CLAIM POLICY RENEW
```

The blue/white design provides trust and clarity.

The product differentiation comes from:

- **My Car**
- **Smart Compare**
- **Explain / Simulate**
- **My Garage**
- **Verified product data**
- **Transparent trade-offs**
- **After-sale support**

---

# 48. Codex Instruction Summary

When continuing in Codex:

1. Treat this file as the current source of truth.
2. Preserve the selected blue/white design direction.
3. Do not reduce the product into a generic insurance quotation website.
4. Build motor insurance first.
5. Keep anonymous exploration.
6. Build around structured, versioned insurance data.
7. Do not invent real coverage or premium data.
8. Keep recommendation logic explainable.
9. Preserve quote snapshots.
10. Design post-sale support from the beginning, even if delivered in a later phase.
11. Prioritize mobile.
12. Build reusable components and a maintainable production architecture.
13. Before implementing real product logic, inspect and normalize all provided business data.

---

**End of Project Master / Codex Handoff**