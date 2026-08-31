import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/supabase/types";

/** Row level security decides which properties come back. There is no owner filter
 *  here and there must not be: the policy is the single mechanism. Principle IV. */
export async function listProperties(): Promise<Property[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: true });
  return (data as Property[]) ?? [];
}

export async function getProperty(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Property) ?? null;
}

export async function listPropertiesForOwner(ownerId: string): Promise<Property[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });
  return (data as Property[]) ?? [];
}
