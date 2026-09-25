"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Car, CircleCheck, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VehicleSelector, draftToSelection, type VehicleDraft } from "@/components/insurance/VehicleSelector";
import { buttonClass } from "@/components/ui/button";
import { withJourney } from "@/lib/params";
import type { VehicleCatalog } from "@/lib/types";
import { defaultEvVehicle, defaultVehicle } from "@/lib/vehicle";
import { cx } from "@/lib/cx";

type Tab = "motor" | "ev" | "compulsory";

const tabs: { id: Tab; label: string; icon: typeof Car; disabled?: boolean }[] = [
  { id: "motor", label: "ประกันรถยนต์", icon: Car },
  { id: "ev", label: "ประกันรถ EV", icon: Zap },
  { id: "compulsory", label: "พ.ร.บ.", icon: FileText, disabled: true },
];

export function QuickQuote({ ctaLabel, catalog }: { ctaLabel: string; catalog: VehicleCatalog }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("motor");
  const [draft, setDraft] = useState<VehicleDraft>({ ...defaultVehicle });
  const [error, setError] = useState(false);

  const switchTab = (next: Tab) => {
    setTab(next);
    setDraft({ ...(next === "ev" ? defaultEvVehicle : defaultVehicle) });
    setError(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = draftToSelection(draft);
    if (!vehicle) {
      setError(true);
      return;
    }
    router.push(withJourney("/quote", { vehicle, step: "use" }));
  };

  return (
    <div className="card p-2 sm:p-3">
      <div role="tablist" aria-label="ประเภทประกัน" className="flex gap-1 overflow-x-auto border-b border-navy-100 px-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="quick-quote-panel"
              disabled={t.disabled}
              onClick={() => switchTab(t.id)}
              className={cx(
                "relative inline-flex shrink-0 items-center gap-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4",
                active ? "text-brand-700" : "text-navy-500 hover:text-navy-800",
                t.disabled && "cursor-not-allowed opacity-50 hover:text-navy-500",
              )}
            >
              <Icon aria-hidden className="h-4 w-4" />
              {t.label}
              {t.disabled && <span className="rounded-full bg-navy-50 px-1.5 py-0.5 text-[10px] font-medium text-navy-500">เร็ว ๆ นี้</span>}
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          );
        })}
      </div>

      <form id="quick-quote-panel" role="tabpanel" onSubmit={submit} noValidate className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <VehicleSelector catalog={catalog} value={draft} onChange={(d) => { setDraft(d); setError(false); }} evOnly={tab === "ev"} className="flex-1" />
          <button type="submit" className={buttonClass("primary", "lg", "lg:w-auto")}>
            {ctaLabel}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-danger-600">
            กรุณาเลือกยี่ห้อ รุ่น และปีรถให้ครบ
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-navy-500">
            <CircleCheck aria-hidden className="h-4 w-4 text-brand-600" />
            ฟรี ไม่ผูกมัด ยังไม่ต้องให้เบอร์โทร
          </p>
          <Link href="/advisor" className="font-semibold text-brand-600 hover:text-brand-700">
            ไม่เจอรุ่นรถของคุณ? ให้ที่ปรึกษาช่วยหา
          </Link>
        </div>
      </form>
    </div>
  );
}
