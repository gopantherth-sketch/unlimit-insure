import { TriangleAlert } from "lucide-react";
import type { LegalDoc } from "@/content/legal";
import { formatDate } from "@/lib/format";

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className="container-page max-w-3xl py-10 sm:py-14">
      {doc.status === "draft" && (
        <p className="mb-6 flex items-start gap-2 rounded-2xl bg-warning-50 p-4 text-sm text-warning-700">
          <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          ฉบับร่าง อยู่ระหว่างการตรวจสอบทางกฎหมาย ข้อความในวงเล็บเหลี่ยมคือข้อมูลที่รอยืนยัน
        </p>
      )}
      <h1 className="text-3xl font-bold sm:text-4xl">{doc.title}</h1>
      <p className="mt-2 text-sm text-navy-400">ปรับปรุงล่าสุด {formatDate(doc.lastUpdated)}</p>
      <p className="mt-6 text-[17px] leading-[1.85] text-navy-700">{doc.intro}</p>
      <div className="mt-10 space-y-9">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 text-[16px] leading-[1.85] text-navy-700">{p}</p>
            ))}
            {s.bullets && (
              <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[16px] leading-relaxed text-navy-700 marker:text-brand-500">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
