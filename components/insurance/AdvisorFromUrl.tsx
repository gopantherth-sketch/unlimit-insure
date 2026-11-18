"use client";

import { useSearchParams } from "next/navigation";
import { AdvisorContact } from "@/components/insurance/AdvisorContact";
import { advisorPropsFromParams, toRawParams, type AdvisorCars } from "@/lib/advisor-params";

/**
 * /advisor is prebuilt (CLEAR row 42). The prebuilt HTML holds the plain advisor form (the Suspense fallback
 * in the page); the journey from the URL is applied in the browser. After a client navigation the params
 * are there on the first render.
 */
export function AdvisorFromUrl({ cars, planNames }: { cars: AdvisorCars; planNames: Record<string, string> }) {
  const sp = useSearchParams();
  return <AdvisorContact {...advisorPropsFromParams(toRawParams(sp.toString()), cars, planNames)} />;
}
