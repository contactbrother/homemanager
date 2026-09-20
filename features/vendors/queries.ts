import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/supabase/types";

export async function listVendors(options: { includeInactive?: boolean } = {}): Promise<Vendor[]> {
  const supabase = await createClient();
  let query = supabase.from("vendors").select("*").order("category").order("name");
  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data } = await query;
  return (data as Vendor[]) ?? [];
}
