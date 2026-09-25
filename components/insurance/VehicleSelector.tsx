"use client";

import { ChevronDown } from "lucide-react";
import { useId, useMemo } from "react";
import { brands } from "@/lib/data/vehicles";
import { modelsForBrand, yearsForModel } from "@/lib/vehicle";
import type { VehicleSelection } from "@/lib/types";
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
  value: VehicleDraft;
  onChange: (next: VehicleDraft) => void;
  layout?: "row" | "stack";
  /** Limit choices to battery-electric models. */
  evOnly?: boolean;
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
}) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={props.id} className="field-label">
        {props.label}
      </label>
      <div className="relative">
        <select
          id={props.id}
          className="field-select"
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

export function VehicleSelector({ value, onChange, layout = "row", evOnly = false, className }: Props) {
  const id = useId();
  const brandOptions = useMemo(
    () => (evOnly ? brands.filter((b) => modelsForBrand(b.id).some((m) => m.powertrain === "EV")) : brands),
    [evOnly],
  );
  const modelOptions = useMemo(() => {
    if (!value.brandId) return [];
    const all = modelsForBrand(value.brandId);
    return evOnly ? all.filter((m) => m.powertrain === "EV") : all;
  }, [value.brandId, evOnly]);
  const model = modelOptions.find((m) => m.id === value.modelId);
  const yearOptions = useMemo(() => (model ? yearsForModel(model, new Date().getFullYear()) : []), [model]);

  return (
    <div className={cx("flex gap-3", layout === "row" ? "flex-col sm:flex-row" : "flex-col", className)}>
      <SelectField
        id={`${id}-brand`}
        label="ยี่ห้อรถ"
        placeholder="เลือกยี่ห้อ"
        value={value.brandId}
        options={brandOptions.map((b) => ({ value: b.id, label: b.name }))}
        onChange={(brandId) => onChange({ brandId, modelId: "", year: null })}
      />
      <SelectField
        id={`${id}-model`}
        label="รุ่นรถ"
        placeholder={value.brandId ? "เลือกรุ่น" : "เลือกยี่ห้อก่อน"}
        value={value.modelId}
        disabled={!value.brandId}
        options={modelOptions.map((m) => ({ value: m.id, label: m.name }))}
        onChange={(modelId) => onChange({ ...value, modelId, year: null })}
      />
      <SelectField
        id={`${id}-year`}
        label="ปีรถ"
        placeholder={value.modelId ? "เลือกปี" : "เลือกรุ่นก่อน"}
        value={value.year ? String(value.year) : ""}
        disabled={!value.modelId}
        options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
        onChange={(y) => onChange({ ...value, year: y ? Number(y) : null })}
      />
    </div>
  );
}
