import Link from "next/link";
import { Car } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export function NeedVehicle({ title, body }: { title: string; body: string }) {
  return (
    <div className="container-page max-w-xl py-16 text-center sm:py-24">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Car aria-hidden className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-3 text-navy-500">{body}</p>
      <Link href="/quote" className={buttonClass("primary", "lg", "mt-8")}>
        เพิ่มรถของคุณ
      </Link>
    </div>
  );
}
