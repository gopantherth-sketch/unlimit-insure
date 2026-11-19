// Shop (task C14, brief docs/tasks/shop-option1.md). Car-care products sold as real sales:
// the customer orders on LINE and pays by PromptPay; an admin confirms the slip and ships.
// Products, prices and photos come from the owner only (O12) and live in D1 since C16: admin → ร้านค้า → สินค้า.
// Wording: W13 (Gemini, owner approved 2026-11-19, brief docs/tasks/gemini-w13.md).

export interface ShopVariant {
  /** Stock-keeping id, stored on orders and stock rows. Never rename once orders exist. */
  sku: string;
  /** Size / colour shown in the picker and the order message. */
  label: string;
  /** Price per piece in satang (1 บาท = 100). null = not set yet; the page shows [รอข้อมูล]. */
  priceSatang: number | null;
}

export interface ShopProduct {
  slug: string;
  name: string;
  /** One line under the name on cards. */
  summary: string;
  /** Short paragraphs on the product page: owner facts only (size, material, care). */
  description: string[];
  /** Owner's own photo, uploaded in admin (served from /api/shop/photo/<id>). Absent = a designed placeholder tile. */
  photo?: { src: string; width: number; height: number; alt: string };
  variants: ShopVariant[];
}

export const shopCopy = {
  title: "ร้านค้า",
  eyebrow: "ร้านค้า Unlimit",
  intro: "อุปกรณ์ดูแลรถคัดสรร สั่งซื้อทาง LINE ชำระด้วยพร้อมเพย์",
  howTo: {
    title: "สั่งซื้ออย่างไร",
    steps: [
      "เลือกแบบและจำนวน แล้วกด “สั่งซื้อทาง LINE”",
      "รอแอดมินแจ้งยอดรวมค่าส่งและส่ง QR พร้อมเพย์",
      "ส่งสลิปและที่อยู่ในแชต เราแจ้งเลขพัสดุเมื่อส่ง",
    ],
  },
  seller: "ผู้ขาย: [รอข้อมูล]",
  priceMissing: "ราคา [รอข้อมูล]",
  variant: "แบบ",
  quantity: "จำนวน",
  total: "รวม",
  shippingNote: "ยังไม่รวมค่าส่ง แอดมินแจ้งในแชต",
  soldOut: "สินค้าหมด",
  empty: "ยังไม่มีสินค้าในร้าน [รอข้อมูล]",
  orderButton: "สั่งซื้อทาง LINE",
  backToShop: "กลับไปร้านค้า",
  /** Prefilled LINE order message. The first line lets admins filter shop chats; keep it unchanged. */
  orderMessage: (o: { product: string; variant: string; qty: number; unit: string | null; total: string | null }) =>
    [
      "สั่งซื้อสินค้า (จากเว็บไซต์)",
      `สินค้า: ${o.product}`,
      `แบบ: ${o.variant}`,
      `จำนวน: ${o.qty}`,
      o.unit && o.total ? `ราคาสินค้า: ${o.qty} × ${o.unit} = ${o.total} บาท` : "ราคาสินค้า: (แอดมินแจ้ง)",
      "ค่าส่ง: (แอดมินแจ้ง)",
    ].join("\n"),
};
