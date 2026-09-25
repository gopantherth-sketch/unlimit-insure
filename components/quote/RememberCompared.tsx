"use client";

import { useEffect } from "react";
import { rememberCompared } from "@/lib/journey";

export function RememberCompared({ ids }: { ids: string[] }) {
  const key = ids.join(",");
  useEffect(() => {
    rememberCompared(key.split(","));
  }, [key]);
  return null;
}
