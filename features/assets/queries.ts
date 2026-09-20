import { createClient } from "@/lib/supabase/server";
import type { Asset } from "@/lib/supabase/types";

/** Row level security decides which assets come back. Principle IV. */
export async function listAssets(propertyId: string): Promise<Asset[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("property_id", propertyId)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  return (data as Asset[]) ?? [];
}
