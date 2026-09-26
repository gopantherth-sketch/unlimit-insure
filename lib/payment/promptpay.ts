// PromptPay (Thai QR, EMVCo) payload with amount. Spec: Bank of Thailand "Thai QR Code" standard.

export type PromptPayIdKind = "phone" | "nationalId" | "ewallet";

export function classifyPromptPayId(raw: string): { kind: PromptPayIdKind; value: string } | null {
  const d = raw.replace(/\D/g, "");
  if (/^0\d{9}$/.test(d)) return { kind: "phone", value: `0066${d.slice(1)}` };
  if (/^\d{13}$/.test(d)) return { kind: "nationalId", value: d };
  if (/^\d{15}$/.test(d)) return { kind: "ewallet", value: d };
  return null;
}

const tlv = (tag: string, value: string) => `${tag}${String(value.length).padStart(2, "0")}${value}`;

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF). */
export function crc16(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function promptPayPayload(id: string, amountBaht?: number): string | null {
  const target = classifyPromptPayId(id);
  if (!target) return null;
  const sub = { phone: "01", nationalId: "02", ewallet: "03" }[target.kind];
  const merchant = tlv("00", "A000000677010111") + tlv(sub, target.value);
  let p = tlv("00", "01") + tlv("01", amountBaht ? "12" : "11") + tlv("29", merchant) + tlv("58", "TH") + tlv("53", "764");
  if (amountBaht && amountBaht > 0) p += tlv("54", amountBaht.toFixed(2));
  p += "6304";
  return p + crc16(p);
}
