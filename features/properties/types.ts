import type { Property } from "@/lib/supabase/types";

export type { Property };

export interface PropertyWithCounts extends Property {
  documentCount: number;
  openTaskCount: number;
}
