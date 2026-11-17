// Contact channels confirmed by the owner on 2026-09-26. The only source for LINE, phone and Facebook
// details on the site: change them here, never inline in components.

const lineId = "@unlimit.insure";

/**
 * Licensed non-life insurance brokers (owner-supplied). Name and licence number only: never ID numbers.
 * Expiry dates are tracked in the verify list (content/legal.ts), not shown on the site.
 * The first entry is the operator and data controller of the site.
 */
const brokers = [
  { holder: "นิธิ อภัยสุวรรณ (Nithi Apaisuwan)", licenceNo: "6204049613", expires: "03/11/2570" }, // 2026-09-27
  { holder: "นางสาววนาลี บุญเกิด (Wanalee Boonkoed)", licenceNo: "6204049618", expires: "03/11/2570" }, // 2026-10-09, issued 04/11/2562
];
const broker = brokers[0]!;

export const contact = {
  /** Operator / data controller (individual, no company yet). */
  broker,
  brokers,
  /** Licence line shown in the footer and legal pages. */
  brokerLine: `นายหน้าประกันวินาศภัย ${brokers.map((b) => `${b.holder} ใบอนุญาตเลขที่ ${b.licenceNo}`).join(" · ")}`,
  lineId,
  phoneDisplay: "091-444-5542",
  /** Owner-supplied 2026-09-27: general and personal-data contact. */
  email: "unlimit.adm@gmail.com",
  /** Owner-supplied 2026-09-27: contact address for the legal pages (not shown in the footer). */
  address: "108/66 หมู่บ้านพลีโน่ชัยพฤกษ์ ซอย 5/5 ต.พิมลราช อ.บางบัวทอง จ.นนทบุรี 11110",
  /** E.164 for tel: links. */
  phoneE164: "+66914445542",
  facebookName: "Unlimit Insure",
  facebookUrl: "https://www.facebook.com/Unlimit.th/" as string | null,
  /** Button labels and short prompts used by the contact buttons. */
  labels: {
    line: "แอดไลน์",
    lineLong: "คุยกับเราทาง LINE",
    call: "โทรหาเรา",
    askPrice: "ขอราคาจริงทาง LINE",
    askPriceNote: "บริษัทประกันเป็นผู้พิจารณาราคาจริง ทักมาทาง LINE เพื่อรับใบเสนอราคา ไม่มีค่าใช้จ่าย",
  },
  /** Homepage band: how to get a real quote. */
  quoteBand: {
    eyebrow: "Real quote on LINE",
    // Non-breaking space keeps "ๆ" on the same line as "ง่าย".
    title: "ขอราคาจริงง่าย ๆ ใน 3 ขั้นตอน",
    body: "ที่ปรึกษาขอราคาจริงจากบริษัทประกันให้ พร้อมอธิบายความคุ้มครอง ไม่มีค่าใช้จ่าย",
    steps: [
      { title: "แอดไลน์", body: `กดปุ่มด้านล่าง หรือค้นหา ${lineId} ในแอป LINE` },
      { title: "บอกรถของคุณ", body: "ยี่ห้อ รุ่น ปีรถ และสิ่งที่สำคัญกับคุณ" },
      { title: "รับราคาจริง", body: "พร้อมคำอธิบาย ตัดสินใจเมื่อคุณพร้อม" },
    ],
    qrCaption: "สแกนเพื่อแอดไลน์",
  },
  /** Prefilled LINE messages. The customer sees and can edit them before sending. */
  messages: {
    general: "สวัสดี สนใจปรึกษาเรื่องประกันรถ",
    plan: (plan: string, vehicle?: string | null) =>
      `สวัสดี ขอราคาประกันแผน ${plan}${vehicle ? ` สำหรับ ${vehicle}` : ""}`,
    /**
     * Advisor page message, one detail per line so admins can read it at a glance (owner, 2026-11-17).
     * The first line is fixed so admins can tag or filter website chats in LINE OA Manager.
     * The last three detail lines show options in brackets for the customer to fill in before sending.
     * Wording W11: drafted by Gemini, approved by the owner on 2026-11-17.
     */
    quoteRequest: (q: {
      car?: string | null;
      ev?: boolean;
      year?: number | null;
      trim?: string | null;
      usage?: string;
      priorities?: string[];
      plans?: string[];
      from?: string | null;
    }) =>
      [
        "ขอราคาประกันรถยนต์ (จากเว็บไซต์)",
        `รถ: ${q.car ?? ""}${q.car && q.ev ? " (EV)" : ""}`,
        `ปีรถ: ${q.year ?? ""}`,
        `รุ่นย่อย/เครื่องยนต์: ${q.trim ?? ""}`,
        q.usage ? `การใช้งาน: ${q.usage}` : null,
        q.priorities?.length ? `สิ่งที่สำคัญ: ${q.priorities.join(", ")}` : null,
        q.plans?.length ? `แผนที่สนใจ: ${q.plans.join(", ")}` : null,
        "ประเภทประกัน: (ชั้น 1 / 2+ / 3+)",
        "รูปแบบการซ่อม: (ซ่อมห้าง / ซ่อมอู่)",
        "ประกันเดิมหมดอายุ: (ระบุวันที่ / ยังไม่มี)",
        q.from ? `(จากหน้า: ${q.from})` : null,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    /** Where the customer came from, for the last line of quoteRequest. */
    from: {
      home: "หน้าแรก",
      model: (car: string) => car,
    },
  },
};
