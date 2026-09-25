import { Check, ShieldCheck } from "lucide-react";

/**
 * Illustrated hero visual. Placeholder for licensed car photography (PROJECT_MASTER.md §37):
 * swap the <svg> for next/image once assets are supplied.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden>
      <div className="absolute inset-x-[-10%] inset-y-[-6%] -z-10 rounded-[40%] bg-gradient-to-br from-brand-100 via-brand-50 to-white blur-2xl" />
      <svg viewBox="0 0 560 300" className="w-full" role="presentation">
        <defs>
          <linearGradient id="hv-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#E7EBF5" />
            <stop offset="1" stopColor="#B9C3DA" />
          </linearGradient>
          <linearGradient id="hv-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#26304D" />
            <stop offset="1" stopColor="#0B1330" />
          </linearGradient>
          <linearGradient id="hv-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DDE1FF" stopOpacity="0" />
            <stop offset="1" stopColor="#BAC1FF" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="hv-rim">
            <stop offset="0" stopColor="#F4F6FB" />
            <stop offset="1" stopColor="#A3AEC9" />
          </radialGradient>
        </defs>
        {/* skyline */}
        <g fill="url(#hv-sky)">
          <rect x="300" y="40" width="34" height="150" rx="3" />
          <rect x="340" y="10" width="42" height="180" rx="3" />
          <rect x="388" y="60" width="30" height="130" rx="3" />
          <rect x="424" y="28" width="38" height="162" rx="3" />
          <rect x="468" y="76" width="28" height="114" rx="3" />
          <rect x="120" y="90" width="30" height="100" rx="3" />
          <rect x="156" y="64" width="36" height="126" rx="3" />
        </g>
        {/* road */}
        <ellipse cx="285" cy="262" rx="250" ry="14" fill="#0B1330" opacity="0.12" />
        <path d="M0 276 H560" stroke="#DDE1FF" strokeWidth="2" />
        <path d="M40 288 H120 M180 288 H260 M320 288 H400 M460 288 H540" stroke="#BAC1FF" strokeWidth="3" strokeLinecap="round" />
        {/* body */}
        <path
          d="M40 232 V200 Q42 180 70 174 L150 164 L205 120 Q216 112 234 111 L380 110 Q401 110 416 121 L470 164 L512 174 Q530 180 530 200 V232 Q530 240 520 240 H470 A44 44 0 0 0 382 240 H190 A44 44 0 0 0 102 240 H52 Q40 240 40 232 Z"
          fill="url(#hv-body)"
          stroke="#A3AEC9"
          strokeWidth="1.5"
        />
        <path d="M60 206 H516" stroke="#FFFFFF" strokeWidth="3" opacity="0.9" />
        <path d="M46 222 H524" stroke="#A3AEC9" strokeWidth="1" opacity="0.6" />
        {/* glass */}
        <path d="M170 166 L216 128 Q222 123 232 123 L292 123 V166 Z" fill="url(#hv-glass)" />
        <path d="M304 123 L378 123 Q390 123 398 130 L446 166 H304 Z" fill="url(#hv-glass)" />
        <path d="M232 128 L262 128 L226 162 L200 162 Z" fill="#FFFFFF" opacity="0.08" />
        {/* doors */}
        <path d="M298 168 V236 M190 168 Q186 200 190 236" stroke="#A3AEC9" strokeWidth="1.2" fill="none" />
        <rect x="248" y="184" width="22" height="4" rx="2" fill="#A3AEC9" />
        <rect x="352" y="184" width="22" height="4" rx="2" fill="#A3AEC9" />
        {/* lights */}
        <path d="M500 182 L528 188 L528 197 L506 195 Z" fill="#DDE1FF" stroke="#8C96FA" />
        <path d="M42 186 L60 182 L60 194 L42 196 Z" fill="#C0263A" opacity="0.85" />
        {/* roof rail */}
        <path d="M226 106 H392" stroke="#6F7DA0" strokeWidth="4" strokeLinecap="round" />
        {/* wheels */}
        {[146, 426].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="240" r="36" fill="#172038" />
            <circle cx={cx} cy="240" r="23" fill="url(#hv-rim)" />
            <circle cx={cx} cy="240" r="6" fill="#4C5A7E" />
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x={cx - 2} y="220" width="4" height="14" rx="2" fill="#6F7DA0" transform={`rotate(${a} ${cx} 240)`} />
            ))}
          </g>
        ))}
      </svg>

      <div className="absolute left-0 top-2 w-[210px] rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-lift backdrop-blur sm:left-[-4%] sm:top-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">My Car</p>
        <p className="mt-0.5 text-sm font-bold text-navy-900">Toyota Corolla Cross 2025</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-success-700">
          <ShieldCheck className="h-4 w-4" />
          ตรงกับสิ่งที่ต้องการ 5 จาก 6 ข้อ
        </div>
      </div>

      <div className="absolute bottom-[38%] right-0 hidden rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-lift backdrop-blur sm:block sm:right-[-3%]">
        <ul className="space-y-1.5 text-xs font-medium text-navy-700">
          {["ซ่อมศูนย์", "คุ้มครองน้ำท่วม", "ไม่มีค่าเสียหายส่วนแรก"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success-600" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
