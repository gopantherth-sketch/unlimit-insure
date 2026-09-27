"use client";

import { useEffect } from "react";
import { isStaleBuildError, reloadForStaleBuild } from "@/lib/stale-build";

/** Reloads once when a chunk from a previous deploy fails to load outside rendering (router, events). */
export function StaleBuildGuard() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (isStaleBuildError(e.error ?? { message: e.message })) reloadForStaleBuild();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isStaleBuildError(e.reason)) reloadForStaleBuild();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
