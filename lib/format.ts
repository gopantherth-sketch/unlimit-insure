const thb = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

export const formatNumber = (n: number) => thb.format(n);
export const formatBaht = (n: number) => `${thb.format(n)} บาท`;

/** Compact baht, e.g. 900,000 → "900K", 1,200,000 → "1.2M". */
export function formatBahtShort(n: number): string {
  if (n >= 1_000_000) return `${Number((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${Number((n / 1_000).toFixed(0))}K`;
  return thb.format(n);
}

const thaiDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : thaiDate.format(d);
}
