import type { DocumentRow } from "@/lib/supabase/types";
import type { ExpiryStatus } from "./expiry";

export type { DocumentRow };

export interface DocumentWithStatus extends DocumentRow {
  status: ExpiryStatus;
}
