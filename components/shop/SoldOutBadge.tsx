"use client";

import { useEffect, useState } from "react";
import { shopCopy } from "@/content/shop";

// One request per page, shared by every card (CLEAR row 44). Same data as the product page's picker.
let soldOutRequest: Promise<string[]> | null = null;
function loadSoldOut(): Promise<string[]> {
  soldOutRequest ??= fetch("/api/shop/stock")
    .then((r) => (r.ok ? (r.json() as Promise<{ soldOut?: unknown }>) : { soldOut: [] }))
    .then((d) => (Array.isArray(d.soldOut) ? d.soldOut.filter((s): s is string => typeof s === "string") : []))
    .catch(() => [])
    .finally(() => {
      // Fetch again on the next visit to /shop, so stock set in admin shows without a reload.
      setTimeout(() => (soldOutRequest = null), 0);
    });
  return soldOutRequest;
}

/** "สินค้าหมด" on a product card when every variant is sold out. Shows nothing while loading or if the check fails. */
export function SoldOutBadge({ skus }: { skus: string[] }) {
  const [out, setOut] = useState(false);
  const key = skus.join("|");
  useEffect(() => {
    let live = true;
    loadSoldOut().then((sold) => live && setOut(skus.length > 0 && skus.every((s) => sold.includes(s))));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key stands for skus
  }, [key]);
  if (!out) return null;
  return <span className="absolute left-3 top-3 rounded-full bg-navy-900/85 px-3 py-1 text-xs font-semibold text-white">{shopCopy.soldOut}</span>;
}
