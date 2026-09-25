"use client";

import { useEffect } from "react";
import { rememberCompared } from "@/lib/journey";
import { track } from "@/lib/analytics/track";

export function RememberCompared({ ids }: { ids: string[] }) {
  const key = ids.join(",");
  useEffect(() => {
    rememberCompared(key.split(","));
    track("compare_viewed");
  }, [key]);
  return null;
}
