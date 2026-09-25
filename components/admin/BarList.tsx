import { formatNumber } from "@/lib/format";

export interface BarItem {
  key: string;
  label: string;
  value: number;
  /** Extra text after the value, e.g. a conversion rate. */
  note?: string;
}

/** Single-series horizontal bars with direct value labels. Doubles as the table view. */
export function BarList({ items, caption }: { items: BarItem[]; caption: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">รายการ</th>
          <th scope="col">จำนวน</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.key} title={`${i.label}: ${formatNumber(i.value)}${i.note ? ` · ${i.note}` : ""}`} className="group">
            <th scope="row" className="w-44 py-1.5 pr-3 text-left align-middle font-medium text-navy-700 sm:w-56">
              {i.label}
            </th>
            <td className="py-1.5 align-middle">
              <div className="flex items-center gap-3">
                <div className="h-5 flex-1 rounded-[4px] bg-navy-50">
                  <div
                    className="h-5 rounded-r-[4px] bg-brand-600 transition-opacity group-hover:opacity-80"
                    style={{ width: `${(i.value / max) * 100}%`, minWidth: i.value > 0 ? 4 : 0 }}
                  />
                </div>
                <span className="tabular w-28 shrink-0 text-right text-navy-900">
                  <span className="font-semibold">{formatNumber(i.value)}</span>
                  {i.note && <span className="ml-1.5 text-xs text-navy-500">{i.note}</span>}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
