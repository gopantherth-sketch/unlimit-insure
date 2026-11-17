import type { ShopOrderStatus } from "@/lib/db/schema";

export const shopOrderStatuses: ShopOrderStatus[] = ["pending_payment", "paid", "shipped", "completed", "cancelled"];

/** Allowed moves. Cancelling is possible until the parcel is shipped. */
const moves: Record<ShopOrderStatus, ShopOrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

export const canMoveOrder = (from: ShopOrderStatus, to: ShopOrderStatus) => moves[from].includes(to);
export const nextOrderMoves = (from: ShopOrderStatus) => moves[from];
