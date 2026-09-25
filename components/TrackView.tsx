"use client";

import { useEffect } from "react";
import type { EventName } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/** Counts one anonymous view when mounted. */
export function TrackView({ name, dim }: { name: EventName; dim?: string }) {
  useEffect(() => {
    track(name, dim);
  }, [name, dim]);
  return null;
}
