"use client";

import { CalendarDays, CarFront, ChevronDown, Tag, type LucideIcon } from "lucide-react";
import { useId, useMemo } from "react";
import { modelsForBrand, yearsForModel } from "@/lib/vehicle";
import type { VehicleCatalog, VehicleSelection } from "@/lib/types";
import { cx } from "@/lib/cx";

export interface VehicleDraft {
  brandId: string;
  modelId: string;
  year: number | null;
}

export const emptyDraft: VehicleDraft = { brandId: "", modelId: "", year: null };

export function draftToSelection(d: VehicleDraft): VehicleSelection | null {
  return d.brandId && d.modelId && d.year ? { brandId: d.brandId, modelId: d.modelId, year: d.year } : null;
}

interface Props {
  catalog: VehicleCatalog;
  value: VehicleDraft;
  onChange: (next: VehicleDraft) => void;
  layout?: "row" | "stack";
  /** Limit choices to battery-electric models. */
  evOnly?: boolean;
  /** Decorative icon tile inside each select (homepage quick quote). */
  withIcons?: boolean;
  className?: string;
}

function SelectField(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
  icon?: LucideIcon;
}) {
  const Icon = props.icon;
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={props.id} className="field-label">
        {props.label}
      </label>
      <div className="relative">
        {Icon && (
          <span aria-hidden className="pointer-events-none absolute left-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 bg-navy-50 text-navy-600">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        )}
        <select
          id={props.id}
          className={cx("field-select", Icon && "pl-[52px]")}
          value={props.value}
          disabled={props.disabled}
          onChange={(e) => props.onChange(e.target.value)}
        >
          <option value="">{props.placeholder}</option>
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
      </div>
    </div>
  );
}

export function VehicleSelector({ catalog, value, onChange, layout = "row", evOnly = false, withIcons = false, className }: Props) {
  const id = useId();
  const brandOptions = useMemo(
    () => (evOnly ? catalog.brands.filter((b) => modelsForBrand(catalog, b.id).some((m) => m.powertrain === "EV")) : catalog.brands),
    [catalog, evOnly],
  );
  const modelOptions = useMemo(() => {
    if (!value.brandId) return [];
    const all = modelsForBrand(catalog, value.brandId);
    return evOnly ? all.filter((m) => m.powertrain === "EV") : all;
  }, [catalog, value.brandId, evOnly]);
  const model = modelOptions.find((m) => m.id === value.modelId);
  const yearOptions = useMemo(() => (model ? yearsForModel(model, new Date().getFullYear()) : []), [model]);

  return (
    <div className={cx("flex gap-3", layout === "row" ? "flex-col sm:flex-row" : "flex-col", className)}>
      <SelectField
        id={`${id}-brand`}
        label="ยี่ห้อรถ"
        placeholder="เลือกยี่ห้อ"
        icon={withIcons ? Tag : undefined}
        value={value.brandId}
        options={brandOptions.map((b) => ({ value: b.id, label: b.name }))}
        onChange={(brandId) => onChange({ brandId, modelId: "", year: null })}
      />
      <SelectField
        id={`${id}-model`}
        label="รุ่นรถ"
        placeholder={value.brandId ? "เลือกรุ่น" : "เลือกยี่ห้อก่อน"}
        icon={withIcons ? CarFront : undefined}
        value={value.modelId}
        disabled={!value.brandId}
        options={modelOptions.map((m) => ({ value: m.id, label: m.name }))}
        onChange={(modelId) => onChange({ ...value, modelId, year: null })}
      />
      <SelectField
        id={`${id}-year`}
        label="ปีรถ"
        placeholder={value.modelId ? "เลือกปี" : "เลือกรุ่นก่อน"}
        icon={withIcons ? CalendarDays : undefined}
        value={value.year ? String(value.year) : ""}
        disabled={!value.modelId}
        options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
        onChange={(y) => onChange({ ...value, year: y ? Number(y) : null })}
      />
    </div>
  );
}
