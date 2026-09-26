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
  /** Prefilled LINE messages. The customer sees and can edit them before sending. */
  messages: {
    general: "สวัสดี สนใจปรึกษาเรื่องประกันรถ",
    plan: (plan: string, vehicle?: string | null) =>
      `สวัสดี ขอราคาประกันแผน ${plan}${vehicle ? ` สำหรับ ${vehicle}` : ""}`,
    plans: (plans: string[], vehicle?: string | null) =>
      `สวัสดี ขอราคาและคำแนะนำประกันรถ${vehicle ? ` ${vehicle}` : ""}${plans.length ? ` แผนที่สนใจ: ${plans.join(", ")}` : ""}`,
  },
};
