import type { Metadata } from "next";
import { AdvisorHandoff } from "@/components/insurance/AdvisorHandoff";
import { contextFromParams } from "@/lib/leads";
import type { RawParams } from "@/lib/params";
import { resolveVehicle, vehicleLabel } from "@/lib/vehicle";

export const metadata: Metadata = { title: "ปรึกษาผู้เชี่ยวชาญ" };

export default async function AdvisorPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const context = contextFromParams(await searchParams);
  const vehicle = context.vehicle ? resolveVehicle(context.vehicle) : null;
  const safeContext = { ...context, vehicle: vehicle ? context.vehicle : null };

  return (
    <div className="bg-canvas pb-16">
      <div className="container-page py-10 sm:py-14">
        <p className="eyebrow">Advisor</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">ปรึกษาผู้เชี่ยวชาญฟรี</h1>
        <p className="mt-3 max-w-2xl text-lg text-navy-500">
          ที่ปรึกษาช่วยอธิบายความคุ้มครองและตอบคำถาม โดยเห็นข้อมูลรถและแผนที่คุณดูไว้แล้ว ไม่มีการเร่งให้ตัดสินใจ
        </p>
        <div className="mt-8">
          <AdvisorHandoff context={safeContext} vehicleText={vehicle ? vehicleLabel(vehicle) : null} />
        </div>
      </div>
    </div>
  );
}
