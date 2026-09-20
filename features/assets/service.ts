import type { Asset } from "@/lib/supabase/types";

export type ServiceState = "overdue" | "due_soon" | "ok" | "unknown";

/** When an asset next needs attention, from its last service and interval. */
export function nextServiceOn(asset: Asset): Date | null {
  if (!asset.last_serviced_on || !asset.service_interval_months) return null;
  const [y, m, d] = asset.last_serviced_on.split("-").map(Number);
  return new Date(y, m - 1 + asset.service_interval_months, d);
}

export function serviceState(asset: Asset, today = new Date()): ServiceState {
  const next = nextServiceOn(asset);
  if (!next) return "unknown";
  const days = Math.floor((next.getTime() - startOfDay(today).getTime()) / 86_400_000);
  if (days < 0) return "overdue";
  if (days <= 30) return "due_soon";
  return "ok";
}

export function warrantyState(asset: Asset, today = new Date()): ServiceState {
  if (!asset.warranty_until) return "unknown";
  const [y, m, d] = asset.warranty_until.split("-").map(Number);
  const until = new Date(y, m - 1, d);
  const days = Math.floor((until.getTime() - startOfDay(today).getTime()) / 86_400_000);
  if (days < 0) return "overdue";
  if (days <= 30) return "due_soon";
  return "ok";
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
