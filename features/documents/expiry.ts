import { EXPIRY_WARNING_DAYS } from "@/lib/constants";
import { daysUntil } from "@/lib/format";

export type ExpiryStatus = "none" | "expiring" | "expired";

/**
 * FR-013 to FR-016. Derived at read time, never stored, so it can never be stale.
 *
 * A document with no expiry is never marked (FR-013). A document expiring today counts
 * as expired, not as expiring soon, which the spec's edge cases settle explicitly.
 * Everything else stays quiet (FR-016).
 */
export function expiryStatus(expiresOn: string | null): ExpiryStatus {
  if (!expiresOn) return "none";

  const days = daysUntil(expiresOn);
  if (days <= 0) return "expired";
  if (days <= EXPIRY_WARNING_DAYS) return "expiring";
  return "none";
}

export function expiryLabel(expiresOn: string | null): string | null {
  const status = expiryStatus(expiresOn);
  if (status === "none") return null;
  if (status === "expired") return "Expired";

  const days = daysUntil(expiresOn!);
  return days === 1 ? "Expires tomorrow" : `Expires in ${days} days`;
}

export function expiryTone(status: ExpiryStatus): "quiet" | "warn" | "alert" {
  if (status === "expired") return "alert";
  if (status === "expiring") return "warn";
  return "quiet";
}
