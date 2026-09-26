// Contact channels confirmed by the owner on 2026-09-26. The only source for LINE, phone and Facebook
// details on the site: change them here, never inline in components.

export const contact = {
  lineId: "@unlimit.insure",
  phoneDisplay: "091-444-5542",
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
    askPriceNote: "ราคาขึ้นอยู่กับรถและการพิจารณาของบริษัทประกัน ทักมาเพื่อรับใบเสนอราคาจริง ไม่มีค่าใช้จ่าย",
  },
  /** Homepage band: how to get a real quote. */
  quoteBand: {
    eyebrow: "Real quote on LINE",
    title: "ขอราคาจริงง่าย ๆ ใน 3 ขั้นตอน",
    body: "ราคาประกันขึ้นอยู่กับรถและการพิจารณาของบริษัทประกัน ทักมาคุยกับที่ปรึกษา เราช่วยหาราคาจริงและอธิบายความคุ้มครองให้ ไม่มีค่าใช้จ่าย",
    steps: [
      { title: "แอดไลน์", body: "@unlimit.insure หรือสแกน QR" },
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
    plans: (plans: string[], vehicle?: string | null) =>
      `สวัสดี ขอราคาและคำแนะนำประกันรถ${vehicle ? ` ${vehicle}` : ""}${plans.length ? ` แผนที่สนใจ: ${plans.join(", ")}` : ""}`,
  },
};
