"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bike, Car, CircleCheck, HeartPulse, Plane, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VehicleSelector, draftToSelection, type VehicleDraft } from "@/components/insurance/VehicleSelector";
import { buttonClass } from "@/components/ui/button";
import { withJourney } from "@/lib/params";
import type { VehicleCatalog } from "@/lib/types";
import { defaultEvVehicle, defaultVehicle } from "@/lib/vehicle";
import { cx } from "@/lib/cx";

type Tab = "motor" | "ev" | "motorbike" | "travel" | "health";

// Motor and EV are live. The other tabs mirror the mockup but are not offered yet.
const tabs: { id: Tab; label: string; icon: typeof Car; disabled?: boolean }[] = [
  { id: "motor", label: "ประกันรถยนต์", icon: Car },
  { id: "ev", label: "ประกันรถ EV", icon: Zap },
  { id: "motorbike", label: "ประกันมอเตอร์ไซค์", icon: Bike, disabled: true },
  { id: "travel", label: "ประกันการเดินทาง", icon: Plane, disabled: true },
  { id: "health", label: "ประกันสุขภาพ", icon: HeartPulse, disabled: true },
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
    <div className="overflow-hidden rounded-[20px] border border-navy-100 bg-white shadow-float">
      <div role="tablist" aria-label="ประเภทประกัน" className="flex gap-1 overflow-x-auto bg-navy-50/70 px-2 pt-2 sm:px-4 sm:pt-3">
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
                "relative inline-flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3.5 text-[15px] transition-colors sm:px-6",
                active ? "bg-white font-semibold text-brand-700" : "text-navy-600 hover:text-navy-900",
                t.disabled && "cursor-not-allowed text-navy-400 hover:text-navy-400",
              )}
            >
              {active && <span aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-brand-600" />}
              <Icon aria-hidden className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
              {t.label}
              {t.disabled && <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-navy-500">เร็ว ๆ นี้</span>}
            </button>
          );
        })}
      </div>

      <div id="quick-quote-panel" role="tabpanel" aria-label={tab === "ev" ? "เช็กราคาประกันรถ EV" : "เช็กราคาประกันรถยนต์"}>
      <form onSubmit={submit} noValidate className="px-4 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
          <VehicleSelector
            catalog={catalog}
            value={draft}
            onChange={(d) => {
              setDraft(d);
              setError(false);
            }}
            evOnly={tab === "ev"}
            withIcons
            className="flex-1 sm:gap-4"
          />
          <button type="submit" className={buttonClass("primary", "lg", "w-full rounded-xl text-[17px] lg:h-12 lg:w-auto lg:min-w-[232px]")}>
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
          <p className="flex items-center gap-2 text-navy-600">
            <CircleCheck aria-hidden className="h-[18px] w-[18px] text-brand-600" />
            ฟรี ไม่ผูกมัด ยังไม่ต้องให้เบอร์โทร
          </p>
          <Link href="/advisor" className="link-arrow">
            ไม่เจอรุ่นรถของคุณ? ให้ที่ปรึกษาช่วยหา
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </form>
      </div>
    </div>
  );
}
